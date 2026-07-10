const pool = require('../config/database');

async function addDobColumn() {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS dob DATE
    `);
    console.log('✅ Added dob column to users table');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

addDobColumn();
