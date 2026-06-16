const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('  - users');
    console.log('  - products');
    console.log('  - orders');
    console.log('  - reviews');
    console.log('\n🎉 Sample products added!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
