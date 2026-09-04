import { Request, Response, NextFunction } from 'express';
import { GitHubService } from '../services/github.service.js';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class GitHubController {
  static getAuthorizeUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const state = req.query.state as string | undefined;
      const result = GitHubService.getOAuthAuthorizeUrl(state);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async handleOAuthCallback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      if (!code) {
        throw new AppError('OAuth code is required.', 400, 'MISSING_CODE');
      }

      const result = await GitHubService.exchangeOAuthCode(code);
      return res.status(200).json({
        success: true,
        data: {
          connected: true,
          tokenType: result.tokenType,
          scope: result.scope,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static async discoverRepos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = (req.headers['x-github-token'] as string) || (req.query.token as string);
      if (!token) {
        throw new AppError(
          'GitHub Personal Access Token or OAuth token required in X-GitHub-Token header to discover repositories.',
          400,
          'TOKEN_REQUIRED'
        );
      }

      const repos = await GitHubService.discoverRepositories(token);
      return res.status(200).json({
        success: true,
        data: repos,
      });
    } catch (error) {
      return next(error);
    }
  }

  static connectRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repo = GitHubService.connectRepository(req.tenant!.organizationId, req.user!, req.body);
      return res.status(201).json({
        success: true,
        data: repo,
      });
    } catch (error) {
      return next(error);
    }
  }

  static listRepos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repos = Array.from(store.repositories.values()).filter(
        (r) => r.organizationId === req.tenant!.organizationId
      );
      return res.status(200).json({
        success: true,
        data: repos,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getRepoDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const repo = store.repositories.get(repoId);
      if (!repo || repo.organizationId !== req.tenant!.organizationId) {
        throw new AppError('Repository not found in this organization.', 404, 'REPOSITORY_NOT_FOUND');
      }

      const commitsCount = Array.from(store.commits.values()).filter((c) => c.repositoryId === repo.id).length;
      const prsCount = Array.from(store.pullRequests.values()).filter((p) => p.repositoryId === repo.id).length;
      const issuesCount = Array.from(store.issues.values()).filter((i) => i.repositoryId === repo.id).length;
      const releasesCount = Array.from(store.releases.values()).filter((r) => r.repositoryId === repo.id).length;

      return res.status(200).json({
        success: true,
        data: {
          ...repo,
          stats: {
            commitsCount,
            prsCount,
            issuesCount,
            releasesCount,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static async syncRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const token = (req.headers['x-github-token'] as string) || (req.body.token as string);
      if (!token) {
        throw new AppError('GitHub token required in X-GitHub-Token header to execute sync.', 400, 'TOKEN_REQUIRED');
      }

      const result = await GitHubService.syncRepository(req.tenant!.organizationId, repoId, token);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getCommits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const commits = Array.from(store.commits.values())
        .filter((c) => c.repositoryId === repoId && c.organizationId === req.tenant!.organizationId)
        .sort((a, b) => b.authoredAt.getTime() - a.authoredAt.getTime());

      return res.status(200).json({
        success: true,
        data: commits,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getPullRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const prs = Array.from(store.pullRequests.values())
        .filter((p) => p.repositoryId === repoId && p.organizationId === req.tenant!.organizationId)
        .sort((a, b) => b.prCreatedAt.getTime() - a.prCreatedAt.getTime());

      return res.status(200).json({
        success: true,
        data: prs,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getIssues(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const issues = Array.from(store.issues.values())
        .filter((i) => i.repositoryId === repoId && i.organizationId === req.tenant!.organizationId)
        .sort((a, b) => b.issueCreatedAt.getTime() - a.issueCreatedAt.getTime());

      return res.status(200).json({
        success: true,
        data: issues,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getReleases(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const releases = Array.from(store.releases.values())
        .filter((r) => r.repositoryId === repoId && r.organizationId === req.tenant!.organizationId)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

      return res.status(200).json({
        success: true,
        data: releases,
      });
    } catch (error) {
      return next(error);
    }
  }

  static seedDemo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repo = GitHubService.seedDemoRepository(req.tenant!.organizationId, req.user!);
      return res.status(201).json({
        success: true,
        data: repo,
        meta: {
          note: 'DEMO DATA — Explicitly tagged test repository with simulated commits, PRs, issues, and releases.',
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
