import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AnalyticsController {
  static getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = AnalyticsService.getOrganizationSummary(req.tenant!.organizationId);
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getDoraMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const metrics = AnalyticsService.getDoraMetrics(req.tenant!.organizationId, days);
      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getRepoAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const analytics = AnalyticsService.getRepositoryAnalytics(req.tenant!.organizationId, repoId, days);
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      return next(error);
    }
  }

  static listPipelines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = req.params.repoId
        ? Array.isArray(req.params.repoId)
          ? req.params.repoId[0]
          : String(req.params.repoId)
        : undefined;

      const pipelines = AnalyticsService.listPipelineRuns(req.tenant!.organizationId, repoId);
      return res.status(200).json({
        success: true,
        data: pipelines,
      });
    } catch (error) {
      return next(error);
    }
  }

  static listDeployments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = req.params.repoId
        ? Array.isArray(req.params.repoId)
          ? req.params.repoId[0]
          : String(req.params.repoId)
        : undefined;

      const deployments = AnalyticsService.listDeployments(req.tenant!.organizationId, repoId);
      return res.status(200).json({
        success: true,
        data: deployments,
      });
    } catch (error) {
      return next(error);
    }
  }

  static recordDeployment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const deployment = AnalyticsService.recordDeployment(
        req.tenant!.organizationId,
        repoId,
        req.user!,
        req.body
      );
      return res.status(201).json({
        success: true,
        data: deployment,
      });
    } catch (error) {
      return next(error);
    }
  }
}
