/**
 * migrate.js — chạy tự động trước khi start server trên Railway.
 * Idempotent: có thể chạy nhiều lần không lỗi.
 */
const { spawnSync } = require('child_process');
const path = require('path');

console.log('🚀 Running pre-deploy migrations...');

const migrations = [
  'initDb.js',
  // Thêm các migration khác ở đây nếu cần
  // 'createWishlistTable.js',
  // 'createUserAddressesTable.js',
  // 'addShippingAddressColumn.js',
  // 'upgradeReviews.js',
  // 'migrateAddRole.js',
];

let failed = 0;
for (const file of migrations) {
  const scriptPath = path.join(__dirname, file);
  console.log(`\n▶ Running ${file}...`);
  const res = spawnSync(process.execPath, [scriptPath], {
    cwd: path.dirname(scriptPath),
    stdio: 'inherit',
  });
  if (res.status !== 0) {
    console.error(`❌ ${file} failed with code ${res.status}`);
    failed++;
  } else {
    console.log(`✅ ${file} OK`);
  }
}

if (failed > 0) {
  console.error(`\n❌ ${failed} migration(s) failed. Aborting start.`);
  process.exit(1);
}

console.log('\n✅ All migrations completed. Starting server...\n');