const { Pool, types } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// ÉP pg driver trả về DATE/TIMESTAMP dưới dạng string "YYYY-MM-DD" hoặc "YYYY-MM-DD HH:mm:ss"
// thay vì Date object local timezone — tránh lỗi lùi ngày khi server timezone khác client.
// OID 1082 = DATE, 1114 = TIMESTAMP, 1184 = TIMESTAMPTZ
types.setTypeParser(1082, (val) => val);                       // DATE → "YYYY-MM-DD"
types.setTypeParser(1114, (val) => val);                       // TIMESTAMP → "YYYY-MM-DD HH:mm:ss"
types.setTypeParser(1184, (val) => new Date(val).toISOString()); // TIMESTAMPTZ → ISO string UTC

// Railway/Heroku cấp DATABASE_URL — dùng nó nếu có, fallback về DB_HOST/DB_PORT/...
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      // Railway Postgres BẮT BUỘC SSL. rejectUnauthorized=false cho phép self-signed cert.
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'luxe_jewelry',
      user: process.env.DB_USER || 'postgres',
      // Dùng ?? để chỉ fallback khi biến môi trường THỰC SỰ không tồn tại (null/undefined).
      password: process.env.DB_PASSWORD ?? '1',
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,                           // Giảm từ 20 để tránh quá tải Railway
  min: 2,                            // Keep ít nhất 2 connection luôn sẵn sàng
  idleTimeoutMillis: 10000,          // Giảm xuống 10s - Railway kill connection idle lâu
  connectionTimeoutMillis: 10000,     // Tăng timeout lên 10s cho Railway
  // Quan trọng: Keep connection alive để tránh bị Railway/Postgres kill
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000, // Bắt đầu keep-alive sau 5s
});

console.log('[DB] Pool config:', {
  max: pool.max,
  min: pool.min,
  idleTimeoutMillis: pool.idleTimeoutMillis,
});

// Validate connection trước khi sử dụng — tránh dùng connection đã chết
pool.on('connect', (client) => {
  client.query("SET client_encoding = 'UTF8'").catch(() => {
    // Ignore SET errors — connection vẫn có thể dùng được
  });
});

// Khi connection bị lỗi, pg sẽ tự động xóa khỏi pool
pool.on('error', (err) => {
  console.error('[DB] Unexpected database error (idle client):', err.message);
});

// Health check function — dùng để verify pool còn hoạt động
pool.healthCheck = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch {
    return false;
  }
};

module.exports = pool;