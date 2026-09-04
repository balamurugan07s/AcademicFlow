import crypto from 'crypto';
import { store, UserRecord, OrganizationRecord } from './store.js';
import { hashPassword, verifyPassword } from '../lib/crypto.js';
import { signUserToken } from '../lib/jwt.js';
import { AppError } from '../middlewares/error.middleware.js';

export interface RegisterInput {
  email: string;
  password?: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
  token: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const existing = store.findUserByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    let passwordHash: string | null = null;
    if (input.password) {
      if (input.password.length < 8) {
        throw new AppError('Password must be at least 8 characters long.', 400, 'WEAK_PASSWORD');
      }
      passwordHash = await hashPassword(input.password);
    }

    // 1. Create User
    const user = store.createUser({
      email: input.email,
      name: input.name ?? null,
      passwordHash,
    });

    // 2. Create Default Workspace / Organization for the new user
    const username = input.name || input.email.split('@')[0];
    const baseSlug = username.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const org = store.createOrg({
      name: `${username}'s Workspace`,
      slug,
    });

    // 3. Assign User as OWNER of this organization
    const membership = store.createMembership({
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    });

    // 4. Record Audit Log
    store.createAuditLog({
      organizationId: org.id,
      actorId: user.id,
      actorEmail: user.email,
      action: 'user.registered',
      resourceType: 'organization',
      resourceId: org.id,
      metadata: { initialRole: 'OWNER' },
    });

    // 5. Generate Token
    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: membership.role,
      },
    };
  }

  static async login(input: LoginInput): Promise<AuthResult & { organizations: any[] }> {
    const user = store.findUserByEmail(input.email);
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!input.password) {
      throw new AppError('Password is required.', 400, 'PASSWORD_REQUIRED');
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const memberships = store.listMembershipsForUser(user.id);
    const orgs = memberships.map((m) => {
      const org = store.findOrgById(m.organizationId);
      return {
        id: m.organizationId,
        name: org?.name ?? 'Unknown',
        slug: org?.slug ?? 'unknown',
        role: m.role,
      };
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token,
      organization: orgs[0],
      organizations: orgs,
    };
  }

  static async getProfile(userId: string): Promise<UserRecord> {
    const user = store.findUserById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404, 'USER_NOT_FOUND');
    }
    return user;
  }
}
