const pool = require('../config/database');

async function upgradeReviews() {
  try {
    await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0`);
    console.log('✅ Reviews table upgraded');
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}
upgradeReviews();
