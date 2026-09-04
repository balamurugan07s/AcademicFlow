import crypto from 'crypto';
import { store, OrganizationRecord } from './store.js';
import { Role, AuthenticatedUser } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export interface CreateOrgInput {
  name: string;
  slug: string;
}

export interface InviteMemberInput {
  email: string;
  role: Role;
}

export class OrgService {
  static createOrg(user: AuthenticatedUser, input: CreateOrgInput): OrganizationRecord {
    const slug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = store.findOrgBySlug(slug);
    if (existing) {
      throw new AppError(`Organization slug '${slug}' is already taken.`, 409, 'SLUG_ALREADY_EXISTS');
    }

    const org = store.createOrg({
      name: input.name.trim(),
      slug,
    });

    store.createMembership({
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    });

    store.createAuditLog({
      organizationId: org.id,
      actorId: user.id,
      actorEmail: user.email,
      action: 'organization.created',
      resourceType: 'organization',
      resourceId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return org;
  }

  static getUserOrganizations(userId: string) {
    const memberships = store.listMembershipsForUser(userId);
    return memberships.map((m) => {
      const org = store.findOrgById(m.organizationId);
      return {
        id: m.organizationId,
        name: org?.name ?? 'Unknown',
        slug: org?.slug ?? 'unknown',
        role: m.role,
        createdAt: org?.createdAt,
      };
    });
  }

  static getOrgDetails(orgId: string) {
    const org = store.findOrgById(orgId);
    if (!org) {
      throw new AppError('Organization not found.', 404, 'ORGANIZATION_NOT_FOUND');
    }
    const members = store.listMembershipsForOrg(orgId);
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      avatarUrl: org.avatarUrl,
      createdAt: org.createdAt,
      stats: {
        memberCount: members.length,
      },
    };
  }

  static getOrgMembers(orgId: string) {
    const memberships = store.listMembershipsForOrg(orgId);
    return memberships.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.createdAt,
    }));
  }

  static inviteOrAddMember(orgId: string, actor: AuthenticatedUser, input: InviteMemberInput) {
    let targetUser = store.findUserByEmail(input.email);
    if (!targetUser) {
      // Create user stub for the invited member
      targetUser = store.createUser({
        email: input.email,
        name: input.email.split('@')[0],
      });
    }

    const existingMembership = store.findMembership(orgId, targetUser.id);
    if (existingMembership) {
      throw new AppError('This user is already a member of this organization.', 409, 'ALREADY_MEMBER');
    }

    const membership = store.createMembership({
      organizationId: orgId,
      userId: targetUser.id,
      role: input.role,
    });

    store.createAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'member.added',
      resourceType: 'membership',
      resourceId: membership.id,
      metadata: { targetEmail: targetUser.email, assignedRole: input.role },
    });

    return {
      membershipId: membership.id,
      userId: targetUser.id,
      email: targetUser.email,
      role: membership.role,
    };
  }

  static updateMemberRole(orgId: string, actor: AuthenticatedUser, targetUserId: string, newRole: Role) {
    const membership = store.findMembership(orgId, targetUserId);
    if (!membership) {
      throw new AppError('Target member was not found in this organization.', 404, 'MEMBER_NOT_FOUND');
    }

    // Safety guard: If demoting an OWNER, ensure there is at least one other OWNER
    if (membership.role === 'OWNER' && newRole !== 'OWNER') {
      const allMembers = store.listMembershipsForOrg(orgId);
      const ownerCount = allMembers.filter((m) => m.role === 'OWNER').length;
      if (ownerCount <= 1) {
        throw new AppError('Cannot demote the last remaining owner in the organization.', 400, 'LAST_OWNER_PROTECTION');
      }
    }

    const updated = store.updateMembershipRole(orgId, targetUserId, newRole);

    store.createAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'member.role_updated',
      resourceType: 'membership',
      resourceId: updated.id,
      metadata: { targetUserId, previousRole: membership.role, newRole },
    });

    return updated;
  }

  static removeMember(orgId: string, actor: AuthenticatedUser, targetUserId: string) {
    const membership = store.findMembership(orgId, targetUserId);
    if (!membership) {
      throw new AppError('Target member was not found in this organization.', 404, 'MEMBER_NOT_FOUND');
    }

    if (membership.role === 'OWNER') {
      const allMembers = store.listMembershipsForOrg(orgId);
      const ownerCount = allMembers.filter((m) => m.role === 'OWNER').length;
      if (ownerCount <= 1) {
        throw new AppError('Cannot remove the last remaining owner in the organization.', 400, 'LAST_OWNER_PROTECTION');
      }
    }

    store.removeMembership(orgId, targetUserId);

    store.createAuditLog({
      organizationId: orgId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'member.removed',
      resourceType: 'membership',
      resourceId: membership.id,
      metadata: { removedUserId: targetUserId },
    });

    return { removed: true };
  }
}
