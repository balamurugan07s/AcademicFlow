import crypto from 'crypto';
import { store, SecurityFindingRecord } from './store.js';
import { AuthenticatedUser } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

// Documented Known Vulnerability Database (Common CVEs for Node/JS ecosystems)
const KNOWN_CVE_DATABASE = [
  {
    packageName: 'lodash',
    vulnerableBelow: '4.17.21',
    fixedVersion: '4.17.21',
    severity: 'HIGH' as const,
    cve: 'CVE-2021-23337',
    title: 'Command Injection / Prototype Pollution in lodash',
    description: 'Lodash versions prior to 4.17.21 are vulnerable to command injection via template functions.',
    remediation: 'Upgrade lodash to version 4.17.21 or later.',
  },
  {
    packageName: 'axios',
    vulnerableBelow: '1.7.4',
    fixedVersion: '1.7.4',
    severity: 'MEDIUM' as const,
    cve: 'CVE-2024-39338',
    title: 'Server-Side Request Forgery (SSRF) in axios',
    description: 'Axios versions prior to 1.7.4 are vulnerable to SSRF via absolute path URL redirection.',
    remediation: 'Upgrade axios to version 1.7.4 or later.',
  },
  {
    packageName: 'json5',
    vulnerableBelow: '2.2.2',
    fixedVersion: '2.2.2',
    severity: 'HIGH' as const,
    cve: 'CVE-2022-46175',
    title: 'Prototype Pollution in JSON5',
    description: 'Prototype pollution in JSON5 parser allows malicious property modification on global object.',
    remediation: 'Upgrade json5 to version 2.2.2 or later.',
  },
  {
    packageName: 'minimist',
    vulnerableBelow: '1.2.6',
    fixedVersion: '1.2.6',
    severity: 'CRITICAL' as const,
    cve: 'CVE-2021-44906',
    title: 'Prototype Pollution in minimist',
    description: 'Minimist versions prior to 1.2.6 allow attackers to cause Denial of Service or remote code execution.',
    remediation: 'Upgrade minimist to version 1.2.6 or later.',
  },
];

// Secret Detection Regular Expression Signatures
const SECRET_SIGNATURES = [
  {
    type: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    severity: 'CRITICAL' as const,
    description: 'Hardcoded AWS Access Key ID detected. Potential unauthorized cloud infrastructure access.',
    remediation: 'Revoke the AWS key immediately and load via AWS Secrets Manager or environment variables.',
  },
  {
    type: 'GitHub Personal Access Token',
    regex: /ghp_[0-9a-zA-Z]{36}/,
    severity: 'CRITICAL' as const,
    description: 'Exposed GitHub Personal Access Token. Attackers can access private repositories and organizations.',
    remediation: 'Revoke token in GitHub Developer Settings and use fine-grained repository tokens in environment variables.',
  },
  {
    type: 'Private RSA/SSH Key',
    regex: /-----BEGIN (?:RSA|OPENSSH) PRIVATE KEY-----/,
    severity: 'CRITICAL' as const,
    description: 'Unencrypted private RSA or SSH key discovered in source tree.',
    remediation: 'Remove the private key from Git history immediately and rotate all associated server keys.',
  },
];

export class SecurityService {
  /**
   * Scans a repository package manifest against the documented CVE database.
   */
  static scanDependencies(
    organizationId: string,
    repositoryId: string,
    dependenciesMap: Record<string, string>,
    actor: AuthenticatedUser
  ): SecurityFindingRecord[] {
    const repo = store.repositories.get(repositoryId);
    if (!repo || repo.organizationId !== organizationId) {
      throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
    }

    const detectedFindings: SecurityFindingRecord[] = [];

    for (const [pkg, versionStr] of Object.entries(dependenciesMap)) {
      // Extract numeric clean semver (e.g. "^4.17.15" -> "4.17.15")
      const cleanVer = versionStr.replace(/[\^~>=<]/g, '').trim();

      const matchedAdvisory = KNOWN_CVE_DATABASE.find(
        (advisory) => advisory.packageName.toLowerCase() === pkg.toLowerCase()
      );

      if (matchedAdvisory) {
        // Basic semver comparison
        const isVulnerable = cleanVer < matchedAdvisory.vulnerableBelow;
        if (isVulnerable) {
          const finding: SecurityFindingRecord = {
            id: crypto.randomUUID(),
            repositoryId: repo.id,
            organizationId,
            severity: matchedAdvisory.severity,
            title: `${matchedAdvisory.cve}: ${matchedAdvisory.title}`,
            description: `${matchedAdvisory.description} Remediation: ${matchedAdvisory.remediation}`,
            packageName: pkg,
            vulnerableVersion: cleanVer,
            patchedVersion: matchedAdvisory.fixedVersion,
            detectionSource: 'dependabot_cve_database',
            status: 'OPEN',
            createdAt: new Date(),
          };

          store.securityFindings.set(finding.id, finding);
          detectedFindings.push(finding);
        }
      }
    }

    store.createAuditLog({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'security.dependency_scan_completed',
      resourceType: 'repository',
      resourceId: repo.id,
      metadata: { packagesScanned: Object.keys(dependenciesMap).length, findingsCount: detectedFindings.length },
    });

    return detectedFindings;
  }

  /**
   * Scans text content (e.g. source files, configs, commit diffs) for hardcoded secrets.
   */
  static scanSecrets(
    organizationId: string,
    repositoryId: string,
    filePath: string,
    content: string,
    actor: AuthenticatedUser
  ): SecurityFindingRecord[] {
    const repo = store.repositories.get(repositoryId);
    if (!repo || repo.organizationId !== organizationId) {
      throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
    }

    const detectedFindings: SecurityFindingRecord[] = [];

    for (const sig of SECRET_SIGNATURES) {
      if (sig.regex.test(content)) {
        const finding: SecurityFindingRecord = {
          id: crypto.randomUUID(),
          repositoryId: repo.id,
          organizationId,
          severity: sig.severity,
          title: `Exposed Secret: ${sig.type} in ${filePath}`,
          description: `${sig.description} Location: ${filePath}. Remediation: ${sig.remediation}`,
          packageName: null,
          vulnerableVersion: null,
          patchedVersion: null,
          detectionSource: 'secret_pattern_scanner',
          status: 'OPEN',
          createdAt: new Date(),
        };

        store.securityFindings.set(finding.id, finding);
        detectedFindings.push(finding);
      }
    }

    if (detectedFindings.length > 0) {
      store.createAuditLog({
        organizationId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: 'security.secret_detected',
        resourceType: 'repository',
        resourceId: repo.id,
        metadata: { filePath, findingsCount: detectedFindings.length },
      });
    }

    return detectedFindings;
  }

  /**
   * Updates finding status (Resolution / Dismissal) with RBAC enforcement and audit trail.
   */
  static triageFinding(
    organizationId: string,
    findingId: string,
    newStatus: 'RESOLVED' | 'DISMISSED',
    actor: AuthenticatedUser
  ): SecurityFindingRecord {
    const finding = store.securityFindings.get(findingId);
    if (!finding || finding.organizationId !== organizationId) {
      throw new AppError('Security finding was not found in this organization.', 404, 'FINDING_NOT_FOUND');
    }

    const previousStatus = finding.status;
    finding.status = newStatus;

    store.createAuditLog({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'security.finding_triaged',
      resourceType: 'security_finding',
      resourceId: finding.id,
      metadata: { previousStatus, newStatus, title: finding.title },
    });

    return finding;
  }

  /**
   * Calculates documented repository code health score with full formula transparency.
   */
  static getCodeHealthScore(organizationId: string, repositoryId: string) {
    const repo = store.repositories.get(repositoryId);
    if (!repo || repo.organizationId !== organizationId) {
      throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
    }

    // 1. Open Security Findings
    const findings = Array.from(store.securityFindings.values()).filter(
      (f) => f.repositoryId === repositoryId && f.status === 'OPEN'
    );

    const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = findings.filter((f) => f.severity === 'HIGH').length;
    const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;

    const securityDeductions = criticalCount * 25 + highCount * 15 + mediumCount * 5;

    // 2. CI/CD Pipeline Health
    const runs = Array.from(store.pipelineRuns.values()).filter((r) => r.repositoryId === repositoryId);
    const failedRuns = runs.filter((r) => r.conclusion === 'FAILURE').length;
    const failureRate = runs.length > 0 ? (failedRuns / runs.length) * 100 : 0;
    const buildDeduction = Math.round(failureRate * 0.3); // max 30 points penalty for 100% failing builds

    const totalDeductions = securityDeductions + buildDeduction;
    const score = Math.max(0, 100 - totalDeductions);

    let grade: 'A' | 'B' | 'C' | 'D' = 'A';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 50) grade = 'C';
    else grade = 'D';

    return {
      repositoryId,
      score,
      grade,
      formula: {
        description: 'Base score of 100 minus weighted security vulnerabilities and build failure rate penalty.',
        equation: 'Score = MAX(0, 100 - (Critical*25 + High*15 + Medium*5 + (FailureRate * 0.3)))',
        inputs: {
          criticalVulnerabilities: criticalCount,
          highVulnerabilities: highCount,
          mediumVulnerabilities: mediumCount,
          securityDeductions,
          pipelineRunsTotal: runs.length,
          pipelineFailureRate: `${failureRate.toFixed(1)}%`,
          buildDeduction,
        },
        limitations:
          'Static rule-based evaluation. Does not measure runtime memory safety, dynamic code test coverage, or deep AST cyclomatic complexity.',
      },
      openFindings: findings,
    };
  }
}
