const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock database antes de importar app
jest.mock('../config/database', () => ({
  pool: {
    getConnection: jest.fn(() => Promise.resolve({
      query: jest.fn(),
      release: jest.fn()
    }))
  },
  testConnection: jest.fn(() => Promise.resolve(true))
}));

jest.mock('../repositories/contactRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByContact: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createTable: jest.fn(() => Promise.resolve()),
  createUsersTable: jest.fn(() => Promise.resolve())
}));

jest.mock('../services/authService', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getUserById: jest.fn()
}));

const app = require('../server');
const authService = require('../services/authService');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register user with valid data, set cookie token and return 201', async () => {
      const mockResult = {
        token: 'fake-token-123',
        user: { id: 'user-1', username: 'testuser' }
      };
      authService.registerUser.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockResult);
      expect(authService.registerUser).toHaveBeenCalledWith('testuser', 'password123');

      // Check cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('token='))).toBe(true);
      expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
    });

    it('should return 400 when username is less than 3 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('at least 3 characters'))).toBe(true);
      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('at least 6 characters'))).toBe(true);
      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should return 409 when username already exists', async () => {
      const error = new Error('Username already exists');
      error.status = 409;
      authService.registerUser.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Username already exists');
      expect(authService.registerUser).toHaveBeenCalledWith('existinguser', 'password123');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials, set cookie token and return 200', async () => {
      const mockResult = {
        token: 'fake-login-token',
        user: { id: 'user-2', username: 'loginuser' }
      };
      authService.loginUser.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      expect(authService.loginUser).toHaveBeenCalledWith('loginuser', 'password123');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('token='))).toBe(true);
    });

    it('should return 401 with invalid credentials', async () => {
      const error = new Error('Invalid username or password');
      error.status = 401;
      authService.loginUser.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid username or password');
      expect(authService.loginUser).toHaveBeenCalledWith('wronguser', 'wrongpass');
    });

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Username is required'))).toBe(true);
      expect(authService.loginUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Password is required'))).toBe(true);
      expect(authService.loginUser).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear token cookie and return success message', async () => {
      // Generate a valid token to pass authentication
      const token = jwt.sign({ id: 'user-3', username: 'logoutuser' }, process.env.JWT_SECRET);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('token=;'))).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid cookie token', async () => {
      const mockUser = { id: 'user-4', username: 'meuser', created_at: '2024-01-01' };
      authService.getUserById.mockResolvedValue(mockUser);

      const token = jwt.sign({ id: 'user-4', username: 'meuser' }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(mockUser);
      expect(authService.getUserById).toHaveBeenCalledWith('user-4');
    });

    it('should return 401 without cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
      expect(authService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'token=invalid-token-here');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid or expired token');
    });

    it('should return 404 when user not found', async () => {
      authService.getUserById.mockResolvedValue(null);

      const token = jwt.sign({ id: 'nonexistent-id', username: 'ghost' }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });
});
