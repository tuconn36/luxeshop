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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Railway có thể chậm kết nối lần đầu
  // Quan trọng: Kiểm tra connection trước khi sử dụng để tránh lỗi
  // "Invalid attempt to read client when server is not processing a query"
  allowExitOnIdle: false,
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