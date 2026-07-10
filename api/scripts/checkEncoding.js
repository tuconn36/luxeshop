const pool = require('../config/database');

async function check() {
  const r = await pool.query("SELECT datname, pg_encoding_to_char(encoding) as enc FROM pg_database WHERE datname = current_database()");
  console.log('DB encoding:', r.rows[0]);
  
  // Test lưu tiếng Việt
  const t = await pool.query("SELECT 'Nguyễn Văn Á' as test");
  console.log('Vietnamese test:', t.rows[0]);
  
  await pool.end();
}
check().catch(e => { console.error(e.message); process.exit(1); });
