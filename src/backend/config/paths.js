const path = require('path');

// Project root is 3 levels up from src/backend/config/
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Uploads directory (at project root)
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');

// Frontend dist directory
const FRONTEND_DIST = path.join(PROJECT_ROOT, 'src', 'frontend', 'dist');

module.exports = {
  PROJECT_ROOT,
  UPLOADS_DIR,
  FRONTEND_DIST
};
