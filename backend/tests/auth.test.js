const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../dist/server.js');
const { User } = require('../dist/models/User');
const { PasswordReset } = require('../dist/models/PasswordReset');
const { Session } = require('../dist/models/Session');

describe('Authentication System', () => {
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stadipass-test');
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await PasswordReset.deleteMany({});
    await Session.deleteMany({});

    // Create test users
    testUser = await User.create({
      email: 'test@example.com',
      passwordHash: '$2a$10$test.hash.for.testing',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    });

    testAdmin = await User.create({
      email: 'admin@example.com',
      passwordHash: '$2a$10$test.hash.for.testing',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and send verification email', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.message).toContain('check your email');

      // Verify user was created
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.emailVerifiedAt).toBeFalsy();

      // Verify verification token was created
      const resetRecord = await PasswordReset.findOne({ userId: user._id });
      expect(resetRecord).toBeTruthy();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(409);
    });

    it('should validate input data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        firstName: '',
        lastName: ''
      };

      await request(app)
        .post('/api/auth/signup')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock bcrypt.compare to return true
      const bcrypt = require('bcryptjs');
      const originalCompare = bcrypt.compare;
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.headers['set-cookie']).toBeDefined();

      // Restore original function
      bcrypt.compare = originalCompare;
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/request-reset', () => {
    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/request-reset')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.message).toContain('reset link');

      // Verify reset token was created
      const resetRecord = await PasswordReset.findOne({ userId: testUser._id });
      expect(resetRecord).toBeTruthy();
    });

    it('should return same message for non-existing user (security)', async () => {
      const response = await request(app)
        .post('/api/auth/request-reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('reset link');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Create a reset token
      const token = 'test-reset-token';
      const tokenHash = await require('bcryptjs').hash(token, 10);
      
      await PasswordReset.create({
        userId: testUser._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        ip: '127.0.0.1',
        userAgent: 'test'
      });

      resetToken = token;
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com',
          token: resetToken,
          password: 'newpassword123'
        })
        .expect(200);

      expect(response.body.message).toBe('Password reset successfully');

      // Verify token was marked as used
      const resetRecord = await PasswordReset.findOne({ userId: testUser._id });
      expect(resetRecord.usedAt).toBeTruthy();
    });

    it('should reject invalid token', async () => {
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com',
          token: 'invalid-token',
          password: 'newpassword123'
        })
        .expect(400);
    });

    it('should reject expired token', async () => {
      // Create expired token
      const token = 'expired-token';
      const tokenHash = await require('bcryptjs').hash(token, 10);
      
      await PasswordReset.create({
        userId: testUser._id,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000), // Expired
        ip: '127.0.0.1',
        userAgent: 'test'
      });

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: 'test@example.com',
          token: token,
          password: 'newpassword123'
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let verifyToken;

    beforeEach(async () => {
      // Create a verification token
      const token = 'test-verify-token';
      const tokenHash = await require('bcryptjs').hash(token, 10);
      
      await PasswordReset.create({
        userId: testUser._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        ip: '127.0.0.1',
        userAgent: 'test'
      });

      verifyToken = token;
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          email: 'test@example.com',
          token: verifyToken
        })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');

      // Verify user email was marked as verified
      const user = await User.findById(testUser._id);
      expect(user.emailVerifiedAt).toBeTruthy();
    });

    it('should verify email via GET link', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email')
        .query({
          email: 'test@example.com',
          token: verifyToken
        })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should reject invalid verification token', async () => {
      await request(app)
        .post('/api/auth/verify-email')
        .send({
          email: 'test@example.com',
          token: 'invalid-token'
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/oauth/callback', () => {
    it('should handle Google OAuth callback', async () => {
      // Mock Google OAuth
      const mockGoogleAuth = {
        OAuth2: jest.fn().mockImplementation(() => ({
          getToken: jest.fn().mockResolvedValue({
            tokens: { access_token: 'mock-access-token' }
          }),
          setCredentials: jest.fn(),
        })),
        oauth2: jest.fn().mockReturnValue({
          userinfo: {
            get: jest.fn().mockResolvedValue({
              data: {
                email: 'oauth@example.com',
                given_name: 'OAuth',
                family_name: 'User',
                id: '123456789'
              }
            })
          }
        })
      };

      jest.doMock('googleapis', () => ({ google: mockGoogleAuth }));

      const response = await request(app)
        .post('/api/auth/oauth/callback')
        .send({
          code: 'mock-auth-code',
          state: 'google'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('oauth@example.com');
    });

    it('should handle GitHub OAuth callback', async () => {
      // Mock axios for GitHub OAuth
      const mockAxios = {
        post: jest.fn().mockResolvedValue({
          data: { access_token: 'mock-github-token' }
        }),
        get: jest.fn()
          .mockResolvedValueOnce({
            data: {
              name: 'GitHub User',
              login: 'githubuser',
              id: 123456
            }
          })
          .mockResolvedValueOnce({
            data: [{ email: 'github@example.com', primary: true }]
          })
      };

      jest.doMock('axios', () => ({ default: mockAxios }));

      const response = await request(app)
        .post('/api/auth/oauth/callback')
        .send({
          code: 'mock-github-code',
          state: 'github'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe('github@example.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      // Create a valid JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sub: testUser._id.toString(), email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.id).toBe(testUser._id.toString());
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and clear cookies', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(204);

      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});

