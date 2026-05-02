const request = require('supertest');

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

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    if (req.headers['x-test-no-auth']) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = { id: 'test-user-id', username: 'testuser' };
    next();
  }
}));

jest.mock('../middleware/upload', () => ({
  upload: {
    single: () => (req, res, next) => {
      if (req.headers['x-test-no-file']) {
        req.file = undefined;
      } else {
        req.file = {
          fieldname: 'picture',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: '/mnt/agents/output/html/uploads',
          filename: 'test-file-123.jpg',
          path: '/mnt/agents/output/html/uploads/test-file-123.jpg',
          size: 1024
        };
      }
      next();
    }
  }
}));

const app = require('../server');
const contactRepository = require('../repositories/contactRepository');

describe('Contacts Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /api/contacts (público) ───────────────────────────────
  describe('GET /api/contacts', () => {
    it('should return 200 and array of contacts without authentication', async () => {
      const mockContacts = [
        { id: '1', name: 'Alice Silva', contact: '912345678', email: 'alice@example.com', picture: '/uploads/alice.jpg' },
        { id: '2', name: 'Bob Santos', contact: '923456789', email: 'bob@example.com', picture: '/uploads/bob.jpg' }
      ];
      contactRepository.findAll.mockResolvedValue(mockContacts);

      const res = await request(app).get('/api/contacts');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(mockContacts);
      expect(res.body).toHaveLength(2);
      expect(contactRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no contacts exist', async () => {
      contactRepository.findAll.mockResolvedValue([]);

      const res = await request(app).get('/api/contacts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ─── GET /api/contacts/:id (protegido) ───────────────────────────
  describe('GET /api/contacts/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/contacts/123')
        .set('x-test-no-auth', '1');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should return 200 and contact when authenticated', async () => {
      const mockContact = { id: '123', name: 'Alice Silva', contact: '912345678', email: 'alice@example.com', picture: '/uploads/alice.jpg' };
      contactRepository.findById.mockResolvedValue(mockContact);

      const res = await request(app).get('/api/contacts/123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockContact);
      expect(contactRepository.findById).toHaveBeenCalledWith('123');
    });

    it('should return 404 when contact not found', async () => {
      contactRepository.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/contacts/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contact not found');
    });
  });

  // ─── POST /api/contacts - Validações ───────────────────────────
  describe('POST /api/contacts - Validations', () => {
    it('should return 400 when name is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('more than 5 characters'))).toBe(true);
      expect(contactRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when contact is not exactly 9 digits', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '12345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('exactly 9 digits'))).toBe(true);
      expect(contactRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when contact has non-digit characters', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '91234abc8', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('exactly 9 digits'))).toBe(true);
    });

    it('should return 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('valid email address'))).toBe(true);
      expect(contactRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when picture is missing', async () => {
      contactRepository.findByEmail.mockResolvedValue(null);
      contactRepository.findByContact.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/contacts')
        .set('x-test-no-file', '1')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Picture is required');
      expect(contactRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: '', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Name is required'))).toBe(true);
    });

    it('should return 400 when contact is empty', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Contact is required'))).toBe(true);
    });

    it('should return 400 when email is empty', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '912345678', email: '' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Email is required'))).toBe(true);
    });
  });

  // ─── POST /api/contacts - Duplicidade ───────────────────────────
  describe('POST /api/contacts - Duplicates', () => {
    it('should return 409 when email already exists', async () => {
      contactRepository.findByEmail.mockResolvedValue({ id: '99', email: 'joao@example.com' });
      contactRepository.findByContact.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already in use');
      expect(contactRepository.findByEmail).toHaveBeenCalledWith('joao@example.com');
      expect(contactRepository.create).not.toHaveBeenCalled();
    });

    it('should return 409 when contact already exists', async () => {
      contactRepository.findByEmail.mockResolvedValue(null);
      contactRepository.findByContact.mockResolvedValue({ id: '88', contact: '912345678' });

      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Contact already in use');
      expect(contactRepository.findByContact).toHaveBeenCalledWith('912345678');
      expect(contactRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─── POST /api/contacts - Sucesso ──────────────────────────────
  describe('POST /api/contacts - Success', () => {
    it('should create contact with valid data + auth and return 201', async () => {
      contactRepository.findByEmail.mockResolvedValue(null);
      contactRepository.findByContact.mockResolvedValue(null);
      const createdContact = {
        id: 'new-id',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/test-file-123.jpg'
      };
      contactRepository.create.mockResolvedValue(createdContact);

      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdContact);
      expect(contactRepository.create).toHaveBeenCalledTimes(1);
      const createdArg = contactRepository.create.mock.calls[0][0];
      expect(createdArg.name).toBe('Joao Silva');
      expect(createdArg.contact).toBe('912345678');
      expect(createdArg.email).toBe('joao@example.com');
      expect(createdArg.picture).toBe('/uploads/test-file-123.jpg');
    });
  });

  // ─── PUT /api/contacts/:id - Validações ────────────────────────
  describe('PUT /api/contacts/:id - Validations', () => {
    it('should return 400 when name is invalid (less than 6 chars)', async () => {
      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('more than 5 characters'))).toBe(true);
      expect(contactRepository.update).not.toHaveBeenCalled();
    });

    it('should return 400 when contact is not exactly 9 digits', async () => {
      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva', contact: '12345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('exactly 9 digits'))).toBe(true);
      expect(contactRepository.update).not.toHaveBeenCalled();
    });

    it('should return 400 when email is invalid', async () => {
      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('valid email address'))).toBe(true);
      expect(contactRepository.update).not.toHaveBeenCalled();
    });

    it('should return 400 when name is empty', async () => {
      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: '', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.msg.includes('Name is required'))).toBe(true);
    });
  });

  // ─── PUT /api/contacts/:id - Duplicidade ───────────────────────
  describe('PUT /api/contacts/:id - Duplicates', () => {
    it('should return 409 when email is duplicate of another contact', async () => {
      contactRepository.findById.mockResolvedValue({
        id: '123',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });
      contactRepository.findByEmail.mockResolvedValue({ id: '999', email: 'other@example.com' });

      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva Updated', contact: '912345678', email: 'other@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already in use');
      expect(contactRepository.update).not.toHaveBeenCalled();
    });

    it('should return 409 when contact is duplicate of another contact', async () => {
      contactRepository.findById.mockResolvedValue({
        id: '123',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });
      contactRepository.findByContact.mockResolvedValue({ id: '888', contact: '987654321' });

      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva Updated', contact: '987654321', email: 'joao@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Contact already in use');
      expect(contactRepository.update).not.toHaveBeenCalled();
    });

    it('should succeed when email is same as current contact (not duplicate)', async () => {
      contactRepository.findById.mockResolvedValue({
        id: '123',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });
      contactRepository.findByEmail.mockResolvedValue({ id: '123', email: 'joao@example.com' });
      contactRepository.update.mockResolvedValue({
        id: '123',
        name: 'Joao Silva Updated',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });

      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva Updated', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Joao Silva Updated');
      expect(contactRepository.update).toHaveBeenCalled();
    });
  });

  // ─── PUT /api/contacts/:id - Sucesso ───────────────────────────
  describe('PUT /api/contacts/:id - Success', () => {
    it('should update contact with valid data and return 200', async () => {
      contactRepository.findById.mockResolvedValue({
        id: '123',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });
      contactRepository.findByEmail.mockResolvedValue(null);
      contactRepository.findByContact.mockResolvedValue(null);
      contactRepository.update.mockResolvedValue({
        id: '123',
        name: 'Joao Silva Updated',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });

      const res = await request(app)
        .put('/api/contacts/123')
        .send({ name: 'Joao Silva Updated', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({
        id: '123',
        name: 'Joao Silva Updated'
      }));
      expect(contactRepository.update).toHaveBeenCalledWith('123', expect.objectContaining({
        name: 'Joao Silva Updated',
        contact: '912345678',
        email: 'joao@example.com'
      }));
    });

    it('should return 404 when updating non-existent contact', async () => {
      contactRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/contacts/999')
        .send({ name: 'Joao Silva', contact: '912345678', email: 'joao@example.com' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contact not found');
      expect(contactRepository.update).not.toHaveBeenCalled();
    });
  });

  // ─── DELETE /api/contacts/:id ──────────────────────────────────
  describe('DELETE /api/contacts/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .delete('/api/contacts/123')
        .set('x-test-no-auth', '1');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should return 204 and delete contact when authenticated', async () => {
      contactRepository.findById.mockResolvedValue({
        id: '123',
        name: 'Joao Silva',
        contact: '912345678',
        email: 'joao@example.com',
        picture: '/uploads/joao.jpg'
      });
      contactRepository.delete.mockResolvedValue(true);

      const res = await request(app).delete('/api/contacts/123');

      expect(res.status).toBe(204);
      expect(contactRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should return 404 when contact not found', async () => {
      contactRepository.findById.mockResolvedValue(null);

      const res = await request(app).delete('/api/contacts/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contact not found');
      expect(contactRepository.delete).not.toHaveBeenCalled();
    });
  });
});
