import { Response, NextFunction } from 'express';
import { OrgService } from '../services/org.service.js';
import { store } from '../services/store.js';
import { AuthenticatedRequest } from '../types/index.js';

export class OrgController {
  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const org = OrgService.createOrg(req.user!, req.body);
      return res.status(201).json({
        success: true,
        data: org,
      });
    } catch (error) {
      return next(error);
    }
  }

  static listMyOrgs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orgs = OrgService.getUserOrganizations(req.user!.id);
      return res.status(200).json({
        success: true,
        data: orgs,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const details = OrgService.getOrgDetails(req.tenant!.organizationId);
      return res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const members = OrgService.getOrgMembers(req.tenant!.organizationId);
      return res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      return next(error);
    }
  }

  static inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = OrgService.inviteOrAddMember(req.tenant!.organizationId, req.user!, req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : String(req.params.memberId);
      const result = OrgService.updateMemberRole(
        req.tenant!.organizationId,
        req.user!,
        memberId,
        req.body.role
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : String(req.params.memberId);
      const result = OrgService.removeMember(
        req.tenant!.organizationId,
        req.user!,
        memberId
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = store.listAuditLogsForOrg(req.tenant!.organizationId);
      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      return next(error);
    }
  }
}
