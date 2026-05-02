const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../config/auth');

async function registerUser(username, password) {
  const conn = await pool.getConnection();
  try {
    // Verificar se username já existe
    const existing = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing && existing.length > 0) {
      const error = new Error('Username already exists');
      error.status = 409;
      throw error;
    }

    const hashed = await hashPassword(password);
    const id = uuidv4();

    await conn.query(
      'INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, NOW())',
      [id, username, hashed]
    );

    const token = generateToken({ id, username });
    return { token, user: { id, username } };
  } finally {
    conn.release();
  }
}

async function loginUser(username, password) {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT id, username, password FROM users WHERE username = ?', [username]);
    const user = rows && rows[0];

    if (!user) {
      const error = new Error('Invalid username or password');
      error.status = 401;
      throw error;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      const error = new Error('Invalid username or password');
      error.status = 401;
      throw error;
    }

    const token = generateToken({ id: user.id, username: user.username });
    return {
      token,
      user: { id: user.id, username: user.username }
    };
  } finally {
    conn.release();
  }
}

async function getUserById(id) {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT id, username, created_at FROM users WHERE id = ?', [id]);
    return rows && rows[0] ? { id: rows[0].id, username: rows[0].username, created_at: rows[0].created_at } : null;
  } finally {
    conn.release();
  }
}

module.exports = { registerUser, loginUser, getUserById };
