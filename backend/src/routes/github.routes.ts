import { Router } from 'express';
import { z } from 'zod';
import { GitHubController } from '../controllers/github.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

export const githubRouter = Router();

const connectRepoSchema = {
  body: z.object({
    githubRepoId: z.string().min(1, 'GitHub Repo ID is required'),
    name: z.string().min(1, 'Repository name is required'),
    fullName: z.string().min(1, 'Full name (owner/repo) is required'),
    ownerLogin: z.string().min(1, 'Owner login is required'),
    description: z.string().nullable().optional(),
    defaultBranch: z.string().default('main'),
    isPrivate: z.boolean().default(true),
    htmlUrl: z.string().url('Valid GitHub URL is required'),
  }),
};

// OAuth routes
githubRouter.get('/auth/github/authorize', GitHubController.getAuthorizeUrl);
githubRouter.post('/auth/github/callback', requireAuth, GitHubController.handleOAuthCallback);

// Repository discovery (per-user)
githubRouter.get('/organizations/:orgId/github/repos', requireAuth, requireTenant, GitHubController.discoverRepos);

// Organization repository management
githubRouter.post(
  '/organizations/:orgId/repositories/connect',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN']),
  validate(connectRepoSchema),
  GitHubController.connectRepo
);

githubRouter.get('/organizations/:orgId/repositories', requireAuth, requireTenant, GitHubController.listRepos);

githubRouter.get(
  '/organizations/:orgId/repositories/:repoId',
  requireAuth,
  requireTenant,
  GitHubController.getRepoDetails
);

githubRouter.post(
  '/organizations/:orgId/repositories/:repoId/sync',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'DEVELOPER']),
  GitHubController.syncRepo
);

// Granular resource sub-routes
githubRouter.get(
  '/organizations/:orgId/repositories/:repoId/commits',
  requireAuth,
  requireTenant,
  GitHubController.getCommits
);

githubRouter.get(
  '/organizations/:orgId/repositories/:repoId/pull-requests',
  requireAuth,
  requireTenant,
  GitHubController.getPullRequests
);

githubRouter.get(
  '/organizations/:orgId/repositories/:repoId/issues',
  requireAuth,
  requireTenant,
  GitHubController.getIssues
);

githubRouter.get(
  '/organizations/:orgId/repositories/:repoId/releases',
  requireAuth,
  requireTenant,
  GitHubController.getReleases
);

// Demo data seeder for local evaluation
githubRouter.post(
  '/organizations/:orgId/repositories/demo',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN']),
  GitHubController.seedDemo
);
