import { store } from './store.js';

export interface SearchResultItem {
  type: 'repository' | 'commit' | 'pull_request' | 'issue' | 'deployment' | 'member';
  id: string;
  title: string;
  subtitle: string;
  url?: string;
  metadata?: Record<string, any>;
}

export class SearchService {
  /**
   * Executes a cross-resource global search within an organization boundary.
   */
  static search(organizationId: string, query: string, limit = 20): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Repositories
    for (const r of store.repositories.values()) {
      if (r.organizationId === organizationId) {
        if (r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))) {
          results.push({
            type: 'repository',
            id: r.id,
            title: r.name,
            subtitle: r.fullName,
            url: `/orgs/${r.organizationId}/repos/${r.id}`,
            metadata: { isPrivate: r.isPrivate },
          });
        }
      }
    }

    // 2. Commits
    for (const c of store.commits.values()) {
      if (c.organizationId === organizationId) {
        if (c.sha.toLowerCase().includes(q) || c.message.toLowerCase().includes(q) || c.authorName.toLowerCase().includes(q)) {
          results.push({
            type: 'commit',
            id: c.id,
            title: c.message.slice(0, 80),
            subtitle: `${c.sha.slice(0, 7)} by ${c.authorName}`,
            metadata: { sha: c.sha },
          });
        }
      }
    }

    // 3. Pull Requests
    for (const pr of store.pullRequests.values()) {
      if (pr.organizationId === organizationId) {
        if (pr.title.toLowerCase().includes(q) || String(pr.number) === q || pr.authorLogin.toLowerCase().includes(q)) {
          results.push({
            type: 'pull_request',
            id: pr.id,
            title: `#${pr.number} ${pr.title}`,
            subtitle: `PR state: ${pr.state} by @${pr.authorLogin}`,
            metadata: { state: pr.state },
          });
        }
      }
    }

    // 4. Issues
    for (const iss of store.issues.values()) {
      if (iss.organizationId === organizationId) {
        if (iss.title.toLowerCase().includes(q) || String(iss.number) === q || iss.authorLogin.toLowerCase().includes(q)) {
          results.push({
            type: 'issue',
            id: iss.id,
            title: `#${iss.number} ${iss.title}`,
            subtitle: `Issue state: ${iss.state} by @${iss.authorLogin}`,
            metadata: { state: iss.state },
          });
        }
      }
    }

    // 5. Deployments
    for (const d of store.deployments.values()) {
      if (d.organizationId === organizationId) {
        if (d.version.toLowerCase().includes(q) || d.environment.toLowerCase().includes(q) || d.commitSha.toLowerCase().includes(q)) {
          results.push({
            type: 'deployment',
            id: d.id,
            title: `Deploy ${d.version} (${d.environment})`,
            subtitle: `Status: ${d.status} by ${d.deployedBy}`,
            metadata: { status: d.status },
          });
        }
      }
    }

    // 6. Members
    const memberships = store.listMembershipsForOrg(organizationId);
    for (const m of memberships) {
      if (m.user.email.toLowerCase().includes(q) || (m.user.name && m.user.name.toLowerCase().includes(q))) {
        results.push({
          type: 'member',
          id: m.userId,
          title: m.user.name || m.user.email,
          subtitle: `${m.user.email} (${m.role})`,
          metadata: { role: m.role },
        });
      }
    }

    return results.slice(0, limit);
  }
}
