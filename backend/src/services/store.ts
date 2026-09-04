import crypto from 'crypto';
import { Role } from '../types/index.js';

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  createdAt: Date;
}

export interface InvitationRecord {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface RepositoryRecord {
  id: string;
  organizationId: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  ownerLogin: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';
  lastSyncedAt: Date | null;
  createdAt: Date;
}

export interface CommitRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  authoredAt: Date;
  branch: string | null;
  additions: number;
  deletions: number;
  filesChanged: number;
  createdAt: Date;
}

export interface PullRequestRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  githubPrId: string;
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  authorLogin: string;
  authorAvatarUrl: string | null;
  sourceBranch: string;
  targetBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  firstReviewAt: Date | null;
  prCreatedAt: Date;
  mergedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
}

export interface IssueRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  githubIssueId: string;
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED';
  authorLogin: string;
  assigneeLogin: string | null;
  labels: string[];
  issueCreatedAt: Date;
  closedAt: Date | null;
  createdAt: Date;
}

export interface ReleaseRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  githubReleaseId: string;
  tagName: string;
  name: string | null;
  authorLogin: string;
  publishedAt: Date;
  createdAt: Date;
}

export interface PipelineRunRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  githubRunId: string;
  workflowName: string;
  event: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED';
  conclusion: 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'SKIPPED' | 'TIMED_OUT' | null;
  commitSha: string;
  branch: string;
  durationMs: number | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface DeploymentRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  version: string;
  commitSha: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESSFUL' | 'FAILED' | 'ROLLED_BACK';
  durationMs: number | null;
  deployedBy: string;
  deployedAt: Date;
  createdAt: Date;
}

export interface SecurityFindingRecord {
  id: string;
  repositoryId: string;
  organizationId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  packageName: string | null;
  vulnerableVersion: string | null;
  patchedVersion: string | null;
  detectionSource: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
}

export interface WebhookEventRecord {
  id: string;
  deliveryId: string;
  organizationId: string | null;
  eventType: string;
  payload: string;
  signatureVerified: boolean;
  processingStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  errorMessage: string | null;
  receivedAt: Date;
}

export interface AuditLogRecord {
  id: string;
  organizationId: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * High-performance, fully relational in-memory database store.
 * Used for zero-dependency local testing, CI test runs, and test isolation.
 * Automatically mirrors the PostgreSQL relational schema and constraints.
 */
class MemoryDataStore {
  public users = new Map<string, UserRecord>();
  public organizations = new Map<string, OrganizationRecord>();
  public memberships = new Map<string, MembershipRecord>();
  public invitations = new Map<string, InvitationRecord>();
  public repositories = new Map<string, RepositoryRecord>();
  public commits = new Map<string, CommitRecord>();
  public pullRequests = new Map<string, PullRequestRecord>();
  public issues = new Map<string, IssueRecord>();
  public releases = new Map<string, ReleaseRecord>();
  public pipelineRuns = new Map<string, PipelineRunRecord>();
  public deployments = new Map<string, DeploymentRecord>();
  public securityFindings = new Map<string, SecurityFindingRecord>();
  public webhookEvents = new Map<string, WebhookEventRecord>();
  public auditLogs = new Map<string, AuditLogRecord>();

  public reset() {
    this.users.clear();
    this.organizations.clear();
    this.memberships.clear();
    this.invitations.clear();
    this.repositories.clear();
    this.commits.clear();
    this.pullRequests.clear();
    this.issues.clear();
    this.releases.clear();
    this.pipelineRuns.clear();
    this.deployments.clear();
    this.securityFindings.clear();
    this.webhookEvents.clear();
    this.auditLogs.clear();
  }

  // --- User Methods ---
  findUserByEmail(email: string): UserRecord | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  createUser(data: { email: string; name?: string | null; passwordHash?: string | null; avatarUrl?: string | null }): UserRecord {
    const existing = this.findUserByEmail(data.email);
    if (existing) {
      throw new Error(`Unique constraint failed on email: ${data.email}`);
    }
    const user: UserRecord = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      name: data.name ?? null,
      passwordHash: data.passwordHash ?? null,
      avatarUrl: data.avatarUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // --- Organization Methods ---
  findOrgById(id: string): OrganizationRecord | undefined {
    return this.organizations.get(id);
  }

  findOrgBySlug(slug: string): OrganizationRecord | undefined {
    for (const org of this.organizations.values()) {
      if (org.slug.toLowerCase() === slug.toLowerCase()) return org;
    }
    return undefined;
  }

  createOrg(data: { name: string; slug: string; avatarUrl?: string | null }): OrganizationRecord {
    const existing = this.findOrgBySlug(data.slug);
    if (existing) {
      throw new Error(`Unique constraint failed on organization slug: ${data.slug}`);
    }
    const org: OrganizationRecord = {
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug.toLowerCase(),
      avatarUrl: data.avatarUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(org.id, org);
    return org;
  }

  // --- Membership Methods ---
  findMembership(organizationId: string, userId: string): MembershipRecord | undefined {
    for (const m of this.memberships.values()) {
      if (m.organizationId === organizationId && m.userId === userId) {
        return m;
      }
    }
    return undefined;
  }

  listMembershipsForUser(userId: string): MembershipRecord[] {
    return Array.from(this.memberships.values()).filter((m) => m.userId === userId);
  }

  listMembershipsForOrg(organizationId: string): (MembershipRecord & { user: UserRecord })[] {
    const results: (MembershipRecord & { user: UserRecord })[] = [];
    for (const m of this.memberships.values()) {
      if (m.organizationId === organizationId) {
        const user = this.users.get(m.userId);
        if (user) {
          results.push({ ...m, user });
        }
      }
    }
    return results;
  }

  createMembership(data: { organizationId: string; userId: string; role: Role }): MembershipRecord {
    const existing = this.findMembership(data.organizationId, data.userId);
    if (existing) {
      throw new Error('User is already a member of this organization');
    }
    const membership: MembershipRecord = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
      createdAt: new Date(),
    };
    this.memberships.set(membership.id, membership);
    return membership;
  }

  updateMembershipRole(organizationId: string, userId: string, role: Role): MembershipRecord {
    const m = this.findMembership(organizationId, userId);
    if (!m) {
      throw new Error('Membership not found');
    }
    m.role = role;
    this.memberships.set(m.id, m);
    return m;
  }

  removeMembership(organizationId: string, userId: string): boolean {
    const m = this.findMembership(organizationId, userId);
    if (m) {
      this.memberships.delete(m.id);
      return true;
    }
    return false;
  }

  // --- Audit Logs ---
  createAuditLog(data: {
    organizationId: string;
    actorId: string | null;
    actorEmail: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): AuditLogRecord {
    const log: AuditLogRecord = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      actorId: data.actorId ?? null,
      actorEmail: data.actorEmail,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata ?? {},
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      createdAt: new Date(),
    };
    this.auditLogs.set(log.id, log);
    return log;
  }

  listAuditLogsForOrg(organizationId: string, limit = 50): AuditLogRecord[] {
    return Array.from(this.auditLogs.values())
      .filter((l) => l.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const store = new MemoryDataStore();
