import { store, DeploymentRecord, PipelineRunRecord } from './store.js';
import { AppError } from '../middlewares/error.middleware.js';
import { AuthenticatedUser } from '../types/index.js';

export interface DoraMetricDefinition {
  name: string;
  value: number | null;
  unit: string;
  rating: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';
  definition: string;
  formula: string;
  dataSource: string;
  limitations: string;
}

export interface DoraMetricsResponse {
  timeWindowDays: number;
  deploymentFrequency: DoraMetricDefinition;
  leadTimeForChanges: DoraMetricDefinition;
  changeFailureRate: DoraMetricDefinition;
  meanTimeToRecovery: DoraMetricDefinition;
}

export class AnalyticsService {
  /**
   * High-level organization dashboard metrics summary.
   */
  static getOrganizationSummary(organizationId: string) {
    const repos = Array.from(store.repositories.values()).filter((r) => r.organizationId === organizationId);
    const repoIds = new Set(repos.map((r) => r.id));

    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 86400000);

    const commits = Array.from(store.commits.values()).filter(
      (c) => repoIds.has(c.repositoryId) && c.authoredAt >= thirtyDaysAgo
    );

    const pullRequests = Array.from(store.pullRequests.values()).filter(
      (p) => repoIds.has(p.repositoryId) && p.prCreatedAt >= thirtyDaysAgo
    );

    const openPRs = pullRequests.filter((p) => p.state === 'OPEN');
    const mergedPRs = pullRequests.filter((p) => p.state === 'MERGED');

    const issues = Array.from(store.issues.values()).filter(
      (i) => repoIds.has(i.repositoryId) && i.issueCreatedAt >= thirtyDaysAgo
    );
    const openIssues = issues.filter((i) => i.state === 'OPEN');
    const closedIssues = issues.filter((i) => i.state === 'CLOSED');

    // Unique active contributors in past 30 days
    const contributors = new Set<string>();
    commits.forEach((c) => contributors.add(c.authorEmail.toLowerCase()));
    pullRequests.forEach((p) => contributors.add(p.authorLogin.toLowerCase()));

    // Pipelines summary
    const pipelineRuns = Array.from(store.pipelineRuns.values()).filter(
      (pr) => repoIds.has(pr.repositoryId) && pr.startedAt >= thirtyDaysAgo
    );
    const successfulRuns = pipelineRuns.filter((pr) => pr.conclusion === 'SUCCESS').length;
    const buildSuccessRate =
      pipelineRuns.length > 0 ? Math.round((successfulRuns / pipelineRuns.length) * 100) : null;

    return {
      overview: {
        totalRepositories: repos.length,
        totalCommitsLast30Days: commits.length,
        openPullRequestsCount: openPRs.length,
        mergedPullRequestsCount: mergedPRs.length,
        openIssuesCount: openIssues.length,
        closedIssuesCount: closedIssues.length,
        activeContributorsCount: contributors.size,
        buildSuccessRate,
      },
      repositories: repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        syncStatus: r.syncStatus,
        lastSyncedAt: r.lastSyncedAt,
        commitsCount: Array.from(store.commits.values()).filter((c) => c.repositoryId === r.id).length,
        prsCount: Array.from(store.pullRequests.values()).filter((p) => p.repositoryId === r.id).length,
      })),
    };
  }

  /**
   * Computes DORA delivery metrics with documented definitions, formulas, and limitations.
   */
  static getDoraMetrics(organizationId: string, timeWindowDays = 30): DoraMetricsResponse {
    const repos = Array.from(store.repositories.values()).filter((r) => r.organizationId === organizationId);
    const repoIds = new Set(repos.map((r) => r.id));

    const sinceDate = new Date(Date.now() - timeWindowDays * 86400000);

    // 1. Production Deployments
    const prodDeployments = Array.from(store.deployments.values()).filter(
      (d) => repoIds.has(d.repositoryId) && d.environment === 'PRODUCTION' && d.deployedAt >= sinceDate
    );

    const successfulDeploys = prodDeployments.filter((d) => d.status === 'SUCCESSFUL');
    const failedDeploys = prodDeployments.filter((d) => d.status === 'FAILED');

    // --- Metric 1: Deployment Frequency ---
    const weeks = Math.max(1, timeWindowDays / 7);
    const deploystPerWeek = parseFloat((successfulDeploys.length / weeks).toFixed(2));
    let dfRating: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
    if (prodDeployments.length > 0) {
      if (deploystPerWeek >= 7) dfRating = 'ELITE'; // multiple per day
      else if (deploystPerWeek >= 1) dfRating = 'HIGH'; // once per week to once per day
      else if (deploystPerWeek >= 0.25) dfRating = 'MEDIUM'; // once per month
      else dfRating = 'LOW';
    }

    const deploymentFrequency: DoraMetricDefinition = {
      name: 'Deployment Frequency',
      value: prodDeployments.length > 0 ? deploystPerWeek : null,
      unit: 'deploys/week',
      rating: dfRating,
      definition: 'How often an engineering organization successfully releases code to production.',
      formula: 'COUNT(successful production deployments) / (time_window_days / 7)',
      dataSource: 'deployments table (environment=PRODUCTION, status=SUCCESSFUL)',
      limitations: 'Relies on recorded deployments; untracked or manual hotfixes are not counted.',
    };

    // --- Metric 2: Lead Time for Changes ---
    const mergedPRs = Array.from(store.pullRequests.values()).filter(
      (p) => repoIds.has(p.repositoryId) && p.state === 'MERGED' && p.mergedAt && p.mergedAt >= sinceDate
    );

    let avgLeadTimeHours: number | null = null;
    let ltRating: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

    if (mergedPRs.length > 0) {
      const totalHours = mergedPRs.reduce((acc, p) => {
        const diffMs = p.mergedAt!.getTime() - p.prCreatedAt.getTime();
        return acc + diffMs / (1000 * 3600);
      }, 0);
      avgLeadTimeHours = parseFloat((totalHours / mergedPRs.length).toFixed(1));

      if (avgLeadTimeHours < 24) ltRating = 'ELITE'; // < 1 day
      else if (avgLeadTimeHours < 168) ltRating = 'HIGH'; // < 1 week
      else if (avgLeadTimeHours < 720) ltRating = 'MEDIUM'; // < 1 month
      else ltRating = 'LOW';
    }

    const leadTimeForChanges: DoraMetricDefinition = {
      name: 'Lead Time for Changes',
      value: avgLeadTimeHours,
      unit: 'hours',
      rating: ltRating,
      definition: 'The time elapsed from pull request opening to successful code merge into base branch.',
      formula: 'AVG(pr.merged_at - pr.created_at) across all merged pull requests in window',
      dataSource: 'pull_requests table (state=MERGED)',
      limitations:
        'Measures PR creation to merge. Time spent by developers writing code prior to opening PR is excluded.',
    };

    // --- Metric 3: Change Failure Rate ---
    let cfrValue: number | null = null;
    let cfrRating: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

    if (prodDeployments.length > 0) {
      cfrValue = parseFloat(((failedDeploys.length / prodDeployments.length) * 100).toFixed(1));
      if (cfrValue <= 5) cfrRating = 'ELITE'; // 0-5%
      else if (cfrValue <= 15) cfrRating = 'HIGH'; // 5-15%
      else if (cfrValue <= 30) cfrRating = 'MEDIUM'; // 15-30%
      else cfrRating = 'LOW';
    }

    const changeFailureRate: DoraMetricDefinition = {
      name: 'Change Failure Rate',
      value: cfrValue,
      unit: 'percentage',
      rating: cfrRating,
      definition: 'The percentage of production releases that resulted in degraded service or failure.',
      formula: '(COUNT(failed production deployments) / COUNT(total production deployments)) * 100',
      dataSource: 'deployments table (environment=PRODUCTION)',
      limitations: 'Assumes automated reporting of deployment status; post-deployment rollback detection requires webhook integration.',
    };

    // --- Metric 4: Mean Time to Recovery (MTTR) ---
    const meanTimeToRecovery: DoraMetricDefinition = {
      name: 'Mean Time to Recovery',
      value: null,
      unit: 'hours',
      rating: 'INSUFFICIENT_DATA',
      definition: 'How long it takes to restore service when a production incident or failed deployment occurs.',
      formula: 'AVG(recovery_deployment_time - failed_deployment_time)',
      dataSource: 'deployments & incident logs',
      limitations: 'Requires automated incident or rollback linking to calculate accurately without bias.',
    };

    return {
      timeWindowDays,
      deploymentFrequency,
      leadTimeForChanges,
      changeFailureRate,
      meanTimeToRecovery,
    };
  }

  /**
   * Repository-specific activity analytics (timeline, contributors, cycle time).
   */
  static getRepositoryAnalytics(organizationId: string, repositoryId: string, timeWindowDays = 30) {
    const repo = store.repositories.get(repositoryId);
    if (!repo || repo.organizationId !== organizationId) {
      throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
    }

    const sinceDate = new Date(Date.now() - timeWindowDays * 86400000);

    const commits = Array.from(store.commits.values()).filter(
      (c) => c.repositoryId === repositoryId && c.authoredAt >= sinceDate
    );

    const prs = Array.from(store.pullRequests.values()).filter(
      (p) => p.repositoryId === repositoryId && p.prCreatedAt >= sinceDate
    );

    // Contributor Breakdown
    const authorMap = new Map<string, { commits: number; additions: number; deletions: number }>();
    commits.forEach((c) => {
      const existing = authorMap.get(c.authorName) || { commits: 0, additions: 0, deletions: 0 };
      existing.commits += 1;
      existing.additions += c.additions;
      existing.deletions += c.deletions;
      authorMap.set(c.authorName, existing);
    });

    const contributors = Array.from(authorMap.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    }));

    // PR Cycle Times (hours)
    const cycleTimes = prs
      .filter((p) => p.state === 'MERGED' && p.mergedAt)
      .map((p) => {
        const hours = (p.mergedAt!.getTime() - p.prCreatedAt.getTime()) / (1000 * 3600);
        return {
          prNumber: p.number,
          title: p.title,
          cycleTimeHours: parseFloat(hours.toFixed(1)),
        };
      });

    return {
      repository: {
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
      },
      timeWindowDays,
      stats: {
        totalCommits: commits.length,
        totalPullRequests: prs.length,
        activeContributorsCount: contributors.length,
      },
      contributors,
      cycleTimes,
    };
  }

  /**
   * Lists CI/CD pipeline runs for a repository or entire organization.
   */
  static listPipelineRuns(organizationId: string, repositoryId?: string) {
    let runs = Array.from(store.pipelineRuns.values()).filter((pr) => pr.organizationId === organizationId);
    if (repositoryId) {
      runs = runs.filter((pr) => pr.repositoryId === repositoryId);
    }

    runs.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    const totalRuns = runs.length;
    const successful = runs.filter((r) => r.conclusion === 'SUCCESS').length;
    const failed = runs.filter((r) => r.conclusion === 'FAILURE').length;
    const successRate = totalRuns > 0 ? Math.round((successful / totalRuns) * 100) : 0;

    return {
      summary: {
        totalRuns,
        successful,
        failed,
        successRate,
      },
      runs,
    };
  }

  /**
   * Lists environment deployments and release history.
   */
  static listDeployments(organizationId: string, repositoryId?: string) {
    let deps = Array.from(store.deployments.values()).filter((d) => d.organizationId === organizationId);
    if (repositoryId) {
      deps = deps.filter((d) => d.repositoryId === repositoryId);
    }

    deps.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());

    return {
      deployments: deps,
    };
  }

  /**
   * Records a deployment event with real environment status and audit trail.
   */
  static recordDeployment(
    organizationId: string,
    repositoryId: string,
    actor: AuthenticatedUser,
    data: {
      environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
      version: string;
      commitSha: string;
      status: 'PENDING' | 'RUNNING' | 'SUCCESSFUL' | 'FAILED' | 'ROLLED_BACK';
      durationMs?: number | null;
      deployedBy?: string;
    }
  ): DeploymentRecord {
    const repo = store.repositories.get(repositoryId);
    if (!repo || repo.organizationId !== organizationId) {
      throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
    }

    const deployment: DeploymentRecord = {
      id: crypto.randomUUID(),
      repositoryId,
      organizationId,
      environment: data.environment,
      version: data.version,
      commitSha: data.commitSha,
      status: data.status,
      durationMs: data.durationMs ?? null,
      deployedBy: data.deployedBy || actor.name || actor.email,
      deployedAt: new Date(),
      createdAt: new Date(),
    };

    store.deployments.set(deployment.id, deployment);

    store.createAuditLog({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'deployment.recorded',
      resourceType: 'deployment',
      resourceId: deployment.id,
      metadata: { environment: data.environment, version: data.version, status: data.status },
    });

    return deployment;
  }
}
