import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('Authentication API Endpoints', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and create default workspace', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'alice@example.com',
          password: 'Password123!',
          name: 'Alice Developer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.organization).toBeDefined();
      expect(res.body.data.organization.role).toBe('OWNER');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Original User',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Imposter User',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration with weak password (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'weak@example.com',
          password: '123',
          name: 'Weak Pass',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return valid JWT session token', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bob@example.com',
          password: 'StrongPassword123!',
          name: 'Bob Smith',
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bob@example.com',
          password: 'StrongPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('bob@example.com');
    });

    it('should reject invalid password (401 Unauthorized)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'charlie@example.com',
          password: 'CorrectPassword123!',
          name: 'Charlie',
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'charlie@example.com',
          password: 'WrongPassword456!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should retrieve authenticated user profile with Bearer token', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'Password123!',
          name: 'Me User',
        });

      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('me@example.com');
    });

    it('should reject unauthenticated request without token (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
