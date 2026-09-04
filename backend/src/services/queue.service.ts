import { logger } from '../lib/logger.js';
import { store, CommitRecord, PullRequestRecord, IssueRecord, ReleaseRecord, PipelineRunRecord } from './store.js';

export interface WebhookJobPayload {
  eventId: string;
  deliveryId: string;
  eventType: string;
  payload: any;
}

export class QueueService {
  private static isProcessing = false;
  private static queue: WebhookJobPayload[] = [];

  /**
   * Enqueues a webhook payload for asynchronous background processing.
   */
  static enqueueWebhook(job: WebhookJobPayload) {
    this.queue.push(job);
    logger.info('Webhook job enqueued to worker queue', {
      deliveryId: job.deliveryId,
      eventType: job.eventType,
      queueDepth: this.queue.length,
    });

    // Asynchronously dispatch worker without blocking HTTP thread
    setImmediate(() => {
      this.processNextJob();
    });
  }

  /**
   * Worker consumer process that pops and executes jobs with retries.
   */
  private static async processNextJob() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift();

    if (!job) {
      this.isProcessing = false;
      return;
    }

    const eventRecord = store.webhookEvents.get(job.eventId);
    if (eventRecord) {
      eventRecord.processingStatus = 'PROCESSING';
    }

    let attempts = 0;
    const maxRetries = 3;
    let succeeded = false;

    while (attempts < maxRetries && !succeeded) {
      attempts++;
      try {
        await this.handleEvent(job.eventType, job.payload);
        succeeded = true;

        if (eventRecord) {
          eventRecord.processingStatus = 'PROCESSED';
          eventRecord.errorMessage = null;
        }

        logger.info('Webhook event successfully processed by worker', {
          deliveryId: job.deliveryId,
          eventType: job.eventType,
          attempt: attempts,
        });
      } catch (error: any) {
        logger.warn(`Worker processing attempt ${attempts} failed for event ${job.deliveryId}`, {
          error: error.message,
        });

        if (attempts >= maxRetries) {
          if (eventRecord) {
            eventRecord.processingStatus = 'FAILED';
            eventRecord.errorMessage = error.message;
          }
          logger.error('Worker failed all retries. Job moved to dead-letter state', {
            deliveryId: job.deliveryId,
            error: error.message,
          });
        } else {
          // Exponential backoff delay (simulated)
          await new Promise((r) => setTimeout(r, 10 * attempts));
        }
      }
    }

    this.isProcessing = false;

    // Drain remaining queue
    if (this.queue.length > 0) {
      this.processNextJob();
    }
  }

  /**
   * Processes specific GitHub event types into relational entities.
   */
  private static async handleEvent(eventType: string, payload: any) {
    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      // Event not tied to a repository
      return;
    }

    // Find any connected repositories matching this full name
    const matchingRepos = Array.from(store.repositories.values()).filter(
      (r) => r.fullName.toLowerCase() === repoFullName.toLowerCase()
    );

    if (matchingRepos.length === 0) {
      logger.debug(`No connected repository matches webhook repo ${repoFullName}`);
      return;
    }

    for (const targetRepo of matchingRepos) {
      switch (eventType) {
        case 'push': {
          const commits = payload.commits || [];
          for (const c of commits) {
            // Idempotency: check if commit already exists
            const existingCommit = Array.from(store.commits.values()).find(
              (rec) => rec.repositoryId === targetRepo.id && rec.sha === c.id
            );

            if (!existingCommit) {
              const commit: CommitRecord = {
                id: crypto.randomUUID(),
                repositoryId: targetRepo.id,
                organizationId: targetRepo.organizationId,
                sha: c.id,
                message: c.message || '',
                authorName: c.author?.name || 'Unknown',
                authorEmail: c.author?.email || '',
                authorAvatarUrl: null,
                authoredAt: new Date(c.timestamp || Date.now()),
                branch: payload.ref ? payload.ref.replace('refs/heads/', '') : targetRepo.defaultBranch,
                additions: (c.added || []).length,
                deletions: (c.removed || []).length,
                filesChanged: (c.modified || []).length,
                createdAt: new Date(),
              };
              store.commits.set(commit.id, commit);
            }
          }
          break;
        }

        case 'pull_request': {
          const prData = payload.pull_request;
          if (!prData) break;

          const existingPr = Array.from(store.pullRequests.values()).find(
            (rec) => rec.repositoryId === targetRepo.id && rec.number === prData.number
          );

          const state = prData.state === 'closed' ? (prData.merged_at ? 'MERGED' : 'CLOSED') : 'OPEN';

          if (existingPr) {
            existingPr.title = prData.title || existingPr.title;
            existingPr.state = state;
            existingPr.mergedAt = prData.merged_at ? new Date(prData.merged_at) : null;
            existingPr.closedAt = prData.closed_at ? new Date(prData.closed_at) : null;
            existingPr.additions = prData.additions ?? existingPr.additions;
            existingPr.deletions = prData.deletions ?? existingPr.deletions;
            existingPr.changedFiles = prData.changed_files ?? existingPr.changedFiles;
          } else {
            const newPr: PullRequestRecord = {
              id: crypto.randomUUID(),
              repositoryId: targetRepo.id,
              organizationId: targetRepo.organizationId,
              githubPrId: String(prData.id),
              number: prData.number,
              title: prData.title || 'Untitled PR',
              state,
              authorLogin: prData.user?.login || 'ghost',
              authorAvatarUrl: prData.user?.avatar_url || null,
              sourceBranch: prData.head?.ref || '',
              targetBranch: prData.base?.ref || '',
              additions: prData.additions || 0,
              deletions: prData.deletions || 0,
              changedFiles: prData.changed_files || 0,
              firstReviewAt: null,
              prCreatedAt: new Date(prData.created_at || Date.now()),
              mergedAt: prData.merged_at ? new Date(prData.merged_at) : null,
              closedAt: prData.closed_at ? new Date(prData.closed_at) : null,
              createdAt: new Date(),
            };
            store.pullRequests.set(newPr.id, newPr);
          }
          break;
        }

        case 'issues': {
          const issueData = payload.issue;
          if (!issueData) break;

          const existingIssue = Array.from(store.issues.values()).find(
            (rec) => rec.repositoryId === targetRepo.id && rec.number === issueData.number
          );

          const issueState = issueData.state === 'closed' ? 'CLOSED' : 'OPEN';

          if (existingIssue) {
            existingIssue.title = issueData.title || existingIssue.title;
            existingIssue.state = issueState;
            existingIssue.closedAt = issueData.closed_at ? new Date(issueData.closed_at) : null;
          } else {
            const newIssue: IssueRecord = {
              id: crypto.randomUUID(),
              repositoryId: targetRepo.id,
              organizationId: targetRepo.organizationId,
              githubIssueId: String(issueData.id),
              number: issueData.number,
              title: issueData.title || 'Untitled Issue',
              state: issueState,
              authorLogin: issueData.user?.login || 'ghost',
              assigneeLogin: issueData.assignee?.login || null,
              labels: (issueData.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name)),
              issueCreatedAt: new Date(issueData.created_at || Date.now()),
              closedAt: issueData.closed_at ? new Date(issueData.closed_at) : null,
              createdAt: new Date(),
            };
            store.issues.set(newIssue.id, newIssue);
          }
          break;
        }

        case 'workflow_run': {
          const runData = payload.workflow_run;
          if (!runData) break;

          const existingRun = Array.from(store.pipelineRuns.values()).find(
            (rec) => rec.repositoryId === targetRepo.id && rec.githubRunId === String(runData.id)
          );

          let status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' = 'QUEUED';
          if (runData.status === 'in_progress') status = 'IN_PROGRESS';
          if (runData.status === 'completed') status = 'COMPLETED';

          let conclusion: any = null;
          if (runData.conclusion === 'success') conclusion = 'SUCCESS';
          else if (runData.conclusion === 'failure') conclusion = 'FAILURE';
          else if (runData.conclusion === 'cancelled') conclusion = 'CANCELLED';

          if (existingRun) {
            existingRun.status = status;
            existingRun.conclusion = conclusion;
            existingRun.completedAt = runData.updated_at ? new Date(runData.updated_at) : null;
            if (existingRun.startedAt && existingRun.completedAt) {
              existingRun.durationMs = existingRun.completedAt.getTime() - existingRun.startedAt.getTime();
            }
          } else {
            const startedAt = new Date(runData.run_started_at || runData.created_at || Date.now());
            const completedAt = runData.status === 'completed' && runData.updated_at ? new Date(runData.updated_at) : null;
            const durationMs = completedAt ? completedAt.getTime() - startedAt.getTime() : null;

            const runRecord: PipelineRunRecord = {
              id: crypto.randomUUID(),
              repositoryId: targetRepo.id,
              organizationId: targetRepo.organizationId,
              githubRunId: String(runData.id),
              workflowName: runData.name || 'Workflow',
              event: runData.event || 'push',
              status,
              conclusion,
              commitSha: runData.head_sha || '',
              branch: runData.head_branch || 'main',
              durationMs,
              startedAt,
              completedAt,
              createdAt: new Date(),
            };
            store.pipelineRuns.set(runRecord.id, runRecord);
          }
          break;
        }

        default:
          logger.debug(`Unhandled webhook event type: ${eventType}`);
          break;
      }
    }
  }
}
