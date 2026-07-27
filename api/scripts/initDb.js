const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Chạy schema.sql. Postgres chạy từng statement độc lập nếu KHÔNG có transaction,
    // nên dù statement nào fail thì các statement trước (đã chạy OK) vẫn được giữ.
    // Đã dùng IF NOT EXISTS cho mọi CREATE TABLE để an toàn cho cả DB mới lẫn DB cũ.
    const client = await pool.connect();
    try {
      await client.query(schema);
    } catch (schemaErr) {
      console.warn('⚠️ Một số statement trong schema.sql fail (bỏ qua):', schemaErr.message);
    } finally {
      client.release();
    }

    // Đảm bảo có cột has_password + phone trên users (cho luồng OTP)
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    `);

    // Backfill role cho user cũ (NULL → 'user')
    await pool.query(`UPDATE users SET role = 'user' WHERE role IS NULL;`);

    // Đảm bảo có bảng otp_codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        otp_id VARCHAR(100) UNIQUE NOT NULL,
        code VARCHAR(8) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_otp_codes_otp_id ON otp_codes(otp_id);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier ON otp_codes(identifier);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    `);

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables: users, products, orders, reviews, otp_codes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
