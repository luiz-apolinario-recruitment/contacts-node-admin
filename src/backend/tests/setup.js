// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-jest-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.PORT = '3333';
