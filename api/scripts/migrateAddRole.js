const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'luxe',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    console.log('Adding role column to users table...');
    
    // Add role column if not exists
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    `);
    console.log('✓ Column role added successfully');
    
    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Verification: role column exists');
      console.log('  Type:', result.rows[0].data_type);
    }
    
    await pool.end();
    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
