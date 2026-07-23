const pool = require('../config/database');

async function addShippingAddressColumn() {
  try {
    console.log('Adding shipping_address column to users table...');
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS shipping_address JSONB;
    `);

    console.log('✅ Successfully added shipping_address column');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding shipping_address column:', error);
    process.exit(1);
  }
}

addShippingAddressColumn();
