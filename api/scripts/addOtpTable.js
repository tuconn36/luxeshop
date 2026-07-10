require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

async function addOtpTable() {
  try {
    console.log('📋 Adding OTP table to database...');

    const sql = fs.readFileSync(
      path.join(__dirname, '../database/add_otp_table.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('✅ OTP table created successfully!');
    console.log('📊 Table: otp_codes');
    console.log('   - id (serial)');
    console.log('   - otp_id (unique)');
    console.log('   - code (8 digits)');
    console.log('   - identifier (email/phone)');
    console.log('   - method (email/phone)');
    console.log('   - verified (boolean)');
    console.log('   - expires_at (timestamp)');
    console.log('   - created_at (timestamp)');

  } catch (error) {
    console.error('❌ Error creating OTP table:', error);
  } finally {
    await pool.end();
  }
}

addOtpTable();
