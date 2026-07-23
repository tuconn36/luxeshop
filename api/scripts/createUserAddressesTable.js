const pool = require('../config/database');

async function createUserAddressesTable() {
  try {
    console.log('Creating user_addresses table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100),
        district VARCHAR(100),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default);
    `);

    console.log('✅ Successfully created user_addresses table and indexes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user_addresses table:', error);
    process.exit(1);
  }
}

createUserAddressesTable();
