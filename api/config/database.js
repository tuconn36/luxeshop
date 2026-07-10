const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'luxe_jewelry',
  user: process.env.DB_USER || 'postgres',
  // Dùng ?? để chỉ fallback khi biến môi trường THỰC SỰ không tồn tại (null/undefined).
  // Tránh trường hợp DB_PASSWORD='' bị gán thành '1' do falsy fallback.
  password: process.env.DB_PASSWORD ?? '1',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Set UTF8 on every new connection
pool.on('connect', (client) => {
  client.query("SET client_encoding = 'UTF8'");
});

// Lỗi idle client không được kill cả process — pg sẽ tự xóa client hỏng khỏi pool.
pool.on('error', (err) => {
  console.error('[DB] Unexpected database error (idle client):', err.message);
});

module.exports = pool;
