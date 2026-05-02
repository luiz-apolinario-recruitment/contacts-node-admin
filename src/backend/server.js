const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { pool, testConnection } = require('./config/database');
const { UPLOADS_DIR, FRONTEND_DIST } = require('./config/paths');
const contactRepository = require('./repositories/contactRepository');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

function serveSpaForHtmlRequests(req, res, next) {
  const accept = req.get('accept') || '';
  if (req.method === 'GET' && accept.includes('text/html') && !accept.includes('application/json')) {
    return res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  }
  next();
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve frontend build as static files
app.use(express.static(FRONTEND_DIST));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/contacts', serveSpaForHtmlRequests, contactRoutes);

// SPA fallback - apenas para rotas não-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// 404 handler for unmatched API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.status(404).send('Not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  const isUploadError = err.name === 'MulterError' || err.message?.startsWith('Only image files');
  const status = err.status || (isUploadError ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    message
  });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await contactRepository.createTable();
    await contactRepository.createUsersTable();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

// Start server
async function startServer() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('Server startup error:', err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
