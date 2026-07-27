/**
 * Resync toàn bộ sản phẩm về tiếng Việt + chuẩn hoá giá VNĐ thuần số.
 *
 * - Map name/description sang tiếng Việt (nếu còn tiếng Anh).
 * - Ép price/original_price thành số nguyên VNĐ (loại bỏ " VND", "đ", dấu chấm/phẩy).
 * - Không xoá dữ liệu khác (orders, users...), chỉ UPDATE products.
 *
 * Chạy: `node api/scripts/resyncVietnameseProducts.js`
 */
require('dotenv').config();
const pool = require('../config/database');

// Ép giá trị thành số nguyên VNĐ thuần (loại bỏ mọi ký tự không phải số)
function toVNNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Math.round(value);
  const raw = String(value).trim();
  // Bỏ "VND", "vnđ", "₫", "đ", giữ lại chữ số
  const cleaned = raw
    .replace(/VND/gi, '')
    .replace(/vnđ/gi, '')
    .replace(/₫/g, '')
    .replace(/đ/g, '')
    .replace(/[^0-9.,-]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '');
  if (!cleaned || cleaned === '-') return null;
  const num = parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : null;
}

// Map tên tiếng Anh còn sót lại sang tiếng Việt (thêm vào đây khi phát hiện)
const NAME_OVERRIDES = new Map([
  ['Pearl Necklace', 'Dây chuyền ngọc trai'],
  ['Gold Chain Bracelet', 'Lắc tay vàng'],
  ['Diamond Solitaire Ring', 'Nhẫn kim cương Solitaire'],
  ['Diamond Stud Earrings', 'Hoa tai kim cương'],
  ['Luxury Watch', 'Đồng hồ cao cấp'],
  ['Gold Ring', 'Nhẫn vàng'],
]);

const DESC_OVERRIDES = new Map([
  ['Beautiful pearl necklace', 'Dây chuyền ngọc trai sang trọng'],
  ['Stunning gold bracelet', 'Lắc tay vàng đẳng cấp'],
  ['Classic diamond ring', 'Nhẫn kim cương cổ điển'],
]);

function viName(input) {
  if (!input) return input;
  const trimmed = String(input).trim();
  return NAME_OVERRIDES.get(trimmed) || trimmed;
}

function viDesc(input) {
  if (!input) return input;
  const trimmed = String(input).trim();
  return DESC_OVERRIDES.get(trimmed) || trimmed;
}

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Đang resync sản phẩm về tiếng Việt...\n');

    const { rows } = await client.query(
      'SELECT id, name, description, price, original_price, category FROM products ORDER BY id'
    );

    let updated = 0;
    let priceFixed = 0;
    for (const row of rows) {
      const newName = viName(row.name);
      const newDesc = viDesc(row.description);
      const newPrice = toVNNumber(row.price);
      const newOriginal = toVNNumber(row.original_price);

      const nameChanged = newName !== row.name;
      const descChanged = newDesc !== row.description;
      const priceChanged = newPrice !== null && newPrice !== Number(row.price);
      const originalChanged =
        (newOriginal === null && row.original_price !== null) ||
        (newOriginal !== null && newOriginal !== Number(row.original_price));

      if (nameChanged || descChanged || priceChanged || originalChanged) {
        await client.query(
          `UPDATE products
           SET name = $1,
               description = $2,
               price = COALESCE($3, price),
               original_price = $4
           WHERE id = $5`,
          [newName, newDesc, newPrice, newOriginal, row.id]
        );
        updated++;
        if (priceChanged || originalChanged) priceFixed++;
        if (nameChanged || descChanged) {
          console.log(`  ✏️  #${row.id}: "${row.name}" → "${newName}"`);
        }
      }
    }

    console.log(`\n✅ Đã cập nhật ${updated}/${rows.length} sản phẩm.`);
    console.log(`💰 Số sản phẩm có giá được chuẩn hoá: ${priceFixed}.`);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
