const pool = require('../config/database');

async function migrate() {
  try {
    // Add missing columns to users table
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE`);
    console.log('✅ dob column ready');

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT FALSE`);
    console.log('✅ has_password column ready');

    // Update has_password = TRUE for users that have a real password_hash
    await pool.query(`
      UPDATE users SET has_password = TRUE 
      WHERE password_hash IS NOT NULL 
        AND password_hash != '' 
        AND has_password IS NOT TRUE
    `);
    console.log('✅ has_password values updated');

    console.log('\n✅ Migration complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
