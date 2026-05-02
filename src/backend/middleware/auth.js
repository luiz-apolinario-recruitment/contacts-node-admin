const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

function authenticateToken(req, res, next) {
  // Prioridade: cookie httpOnly (mais seguro)
  let token = req.cookies?.token;

  // Fallback para Authorization header
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };
