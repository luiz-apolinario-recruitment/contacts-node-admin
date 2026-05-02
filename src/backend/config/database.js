const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000,
  connectTimeout: 60000
});

async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('MariaDB connected successfully');
    return true;
  } catch (err) {
    console.error('MariaDB connection error:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, testConnection };
