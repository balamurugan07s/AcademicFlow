import { Response, NextFunction } from 'express';
import { SecurityService } from '../services/security.service.js';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../types/index.js';

export class SecurityController {
  static listFindings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { severity, status } = req.query;
      const repoId = req.params.repoId
        ? Array.isArray(req.params.repoId)
          ? req.params.repoId[0]
          : String(req.params.repoId)
        : undefined;

      let findings = Array.from(store.securityFindings.values()).filter(
        (f) => f.organizationId === req.tenant!.organizationId
      );

      if (repoId) {
        findings = findings.filter((f) => f.repositoryId === repoId);
      }
      if (severity) {
        findings = findings.filter((f) => f.severity === (severity as string).toUpperCase());
      }
      if (status) {
        findings = findings.filter((f) => f.status === (status as string).toUpperCase());
      }

      findings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return res.status(200).json({
        success: true,
        data: findings,
      });
    } catch (error) {
      return next(error);
    }
  }

  static scanDependencies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const dependencies = req.body.dependencies || {};
      const findings = SecurityService.scanDependencies(
        req.tenant!.organizationId,
        repoId,
        dependencies,
        req.user!
      );

      return res.status(200).json({
        success: true,
        data: {
          scannedDependenciesCount: Object.keys(dependencies).length,
          vulnerabilitiesDetected: findings.length,
          findings,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static scanSecrets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const { filePath, content } = req.body;
      const findings = SecurityService.scanSecrets(
        req.tenant!.organizationId,
        repoId,
        filePath,
        content,
        req.user!
      );

      return res.status(200).json({
        success: true,
        data: {
          filePath,
          secretsDetected: findings.length,
          findings,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static triageFinding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const findingId = Array.isArray(req.params.findingId)
        ? req.params.findingId[0]
        : String(req.params.findingId);
      const { status } = req.body;

      const updated = SecurityService.triageFinding(
        req.tenant!.organizationId,
        findingId,
        status,
        req.user!
      );

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getCodeHealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const repoId = Array.isArray(req.params.repoId) ? req.params.repoId[0] : String(req.params.repoId);
      const health = SecurityService.getCodeHealthScore(req.tenant!.organizationId, repoId);
      return res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      return next(error);
    }
  }
}
