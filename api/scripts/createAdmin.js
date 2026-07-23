require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const email = 'admin@luxe.vn';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@luxe.vn');
      console.log('🔑 Password: admin123');
      return;
    }

    // Insert admin user — has_password=TRUE để login bằng mật khẩu, role='admin' để vào trang admin
    await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, role, has_password, created_at)
       VALUES ($1, $2, $3, $4, 'admin', TRUE, NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = 'admin',
         has_password = TRUE,
         name = COALESCE(users.name, EXCLUDED.name)`,
      [email, passwordHash, 'Administrator', '0865577745']
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('📧 Email: admin@luxe.vn');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🌐 Login at: http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
