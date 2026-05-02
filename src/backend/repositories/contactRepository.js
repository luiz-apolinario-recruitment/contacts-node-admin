const { pool } = require('../config/database');

class ContactRepository {
  async findAll() {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT id, name, contact, email, picture, created_at, updated_at FROM contacts ORDER BY created_at DESC');
      return rows;
    } finally {
      conn.release();
    }
  }

  async findById(id) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT id, name, contact, email, picture, created_at, updated_at FROM contacts WHERE id = ?', [id]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  async findByEmail(email) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT * FROM contacts WHERE email = ?', [email]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  async findByContact(contact) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT * FROM contacts WHERE contact = ?', [contact]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO contacts (id, name, contact, email, picture, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [data.id, data.name, data.contact, data.email, data.picture]
      );
      return data;
    } finally {
      conn.release();
    }
  }

  async update(id, data) {
    const conn = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
      if (data.contact !== undefined) { fields.push('contact = ?'); values.push(data.contact); }
      if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
      if (data.picture !== undefined) { fields.push('picture = ?'); values.push(data.picture); }
      if (fields.length === 0) return await this.findById(id);
      fields.push('updated_at = NOW()');
      values.push(id);
      await conn.query(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`, values);
      return await this.findById(id);
    } finally {
      conn.release();
    }
  }

  async delete(id) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query('DELETE FROM contacts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  async createTable() {
    const conn = await pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact VARCHAR(9) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          picture VARCHAR(500) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('Contacts table initialized');
    } finally {
      conn.release();
    }
  }

  async createUsersTable() {
    const conn = await pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('Users table initialized');
    } finally {
      conn.release();
    }
  }
}

module.exports = new ContactRepository();
