const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Tất cả endpoints trong file này đều yêu cầu admin.
// router.use được áp dụng trong server.js bằng prefix '/api/admin'.
router.use(authMiddleware, adminMiddleware);

// ============ HELPERS ============

async function ensureTables() {
  // Categories đơn giản hóa: danh sách tên + slug. Tránh trùng với category string field trong products.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT,
      image VARCHAR(255),
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS promotions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
      discount_value NUMERIC(10,2) NOT NULL,
      min_order_amount NUMERIC(12,2) DEFAULT 0,
      max_discount_amount NUMERIC(12,2),
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      starts_at TIMESTAMP,
      ends_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      image_url VARCHAR(500) NOT NULL,
      link_url VARCHAR(500),
      button_text VARCHAR(100),
      position VARCHAR(50) DEFAULT 'home',
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      starts_at TIMESTAMP,
      ends_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

ensureTables().catch((e) => {
  console.error('[admin] ensureTables error:', e.message);
});

// ============ CATEGORIES ============

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
    );
    res.json(result.rows);
  } catch (e) {
    console.error('list categories:', e);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, image, sort_order, is_active } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Tên và slug là bắt buộc' });
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, image, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6, TRUE)) RETURNING *`,
      [name, slug, description || null, image || null, Number(sort_order) || 0, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Tên hoặc slug đã tồn tại' });
    console.error('create category:', e);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { name, slug, description, image, sort_order, is_active } = req.body;
    const result = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = $3,
        image = $4,
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, slug, description ?? null, image ?? null, sort_order != null ? Number(sort_order) : null, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Tên hoặc slug đã tồn tại' });
    console.error('update category:', e);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('delete category:', e);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ PROMOTIONS / COUPONS ============

router.get('/promotions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM promotions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (e) {
    console.error('list promotions:', e);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

router.post('/promotions', async (req, res) => {
  try {
    const {
      code, name, description, discount_type, discount_value,
      min_order_amount, max_discount_amount, usage_limit,
      starts_at, ends_at, is_active,
    } = req.body;
    if (!code || !name || !discount_value) {
      return res.status(400).json({ error: 'Thiếu mã, tên hoặc giá trị giảm giá' });
    }
    const result = await pool.query(
      `INSERT INTO promotions
        (code, name, description, discount_type, discount_value,
         min_order_amount, max_discount_amount, usage_limit,
         starts_at, ends_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11, TRUE)) RETURNING *`,
      [
        String(code).toUpperCase(),
        name,
        description || null,
        discount_type || 'percent',
        Number(discount_value),
        Number(min_order_amount) || 0,
        max_discount_amount != null ? Number(max_discount_amount) : null,
        usage_limit != null ? Number(usage_limit) : null,
        starts_at || null,
        ends_at || null,
        is_active,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Mã khuyến mãi đã tồn tại' });
    console.error('create promotion:', e);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

router.put('/promotions/:id', async (req, res) => {
  try {
    const {
      name, description, discount_type, discount_value,
      min_order_amount, max_discount_amount, usage_limit,
      starts_at, ends_at, is_active,
    } = req.body;
    const result = await pool.query(
      `UPDATE promotions SET
        name = COALESCE($1, name),
        description = $2,
        discount_type = COALESCE($3, discount_type),
        discount_value = COALESCE($4, discount_value),
        min_order_amount = COALESCE($5, min_order_amount),
        max_discount_amount = $6,
        usage_limit = $7,
        starts_at = $8,
        ends_at = $9,
        is_active = COALESCE($10, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [
        name, description ?? null, discount_type, discount_value != null ? Number(discount_value) : null,
        min_order_amount != null ? Number(min_order_amount) : null,
        max_discount_amount != null ? Number(max_discount_amount) : null,
        usage_limit != null ? Number(usage_limit) : null,
        starts_at || null,
        ends_at || null,
        is_active,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error('update promotion:', e);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

router.delete('/promotions/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM promotions WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Promotion not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('delete promotion:', e);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// ============ BANNERS ============

router.get('/banners', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM banners ORDER BY position ASC, sort_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (e) {
    console.error('list banners:', e);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const {
      title, subtitle, image_url, link_url, button_text,
      position, sort_order, is_active, starts_at, ends_at,
    } = req.body;
    if (!title || !image_url) return res.status(400).json({ error: 'Tiêu đề và ảnh là bắt buộc' });
    const result = await pool.query(
      `INSERT INTO banners
        (title, subtitle, image_url, link_url, button_text,
         position, sort_order, is_active, starts_at, ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,0),COALESCE($8,TRUE),$9,$10) RETURNING *`,
      [title, subtitle || null, image_url, link_url || null, button_text || null,
       position || 'home', sort_order != null ? Number(sort_order) : 0, is_active,
       starts_at || null, ends_at || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('create banner:', e);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const {
      title, subtitle, image_url, link_url, button_text,
      position, sort_order, is_active, starts_at, ends_at,
    } = req.body;
    const result = await pool.query(
      `UPDATE banners SET
        title = COALESCE($1, title),
        subtitle = $2,
        image_url = COALESCE($3, image_url),
        link_url = $4,
        button_text = $5,
        position = COALESCE($6, position),
        sort_order = COALESCE($7, sort_order),
        is_active = COALESCE($8, is_active),
        starts_at = $9,
        ends_at = $10,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, subtitle ?? null, image_url, link_url ?? null, button_text ?? null,
       position, sort_order != null ? Number(sort_order) : null, is_active,
       starts_at || null, ends_at || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error('update banner:', e);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM banners WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('delete banner:', e);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// ============ SETTINGS ============
// Lưu dưới dạng key/value JSON, dễ mở rộng mà không cần ALTER TABLE.

const DEFAULT_SETTINGS = {
  site_name: 'LUXE Jewelry',
  site_tagline: 'Trang sức cao cấp',
  contact_email: 'support@luxe.vn',
  contact_phone: '0901 234 567',
  contact_address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  social_facebook: '',
  social_instagram: '',
  social_tiktok: '',
  social_youtube: '',
  social_zalo: '',
  shipping_note: 'Free ship đơn từ 500.000đ trong nội thành. Đổi trả trong 7 ngày.',
  maintenance_mode: false,
  cod_enabled: true,
  vnpay_enabled: true,
  vietqr_enabled: true,
};

router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings');
    const map = {};
    for (const r of result.rows) {
      map[r.key] = r.value;
    }
    const merged = {};
    for (const [k, def] of Object.entries(DEFAULT_SETTINGS)) {
      merged[k] = (map[k] !== undefined && map[k] !== null) ? map[k] : def;
    }
    for (const [k, v] of Object.entries(map)) {
      if (!(k in merged)) merged[k] = v;
    }
    res.json(merged);
  } catch (e) {
    console.error('get settings:', e);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const incoming = req.body || {};
    if (typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ error: 'Body phải là object' });
    }
    for (const [key, value] of Object.entries(incoming)) {
      if (!/^[a-z0-9_]{1,100}$/i.test(key)) continue;
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value)]
      );
    }
    res.json({ message: 'Cập nhật thành công' });
  } catch (e) {
    console.error('update settings:', e);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============ ANALYTICS ============

router.get('/analytics/overview', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const [
      revenueAgg,
      orderStats,
      customerStats,
      topProductsResult,
      topCustomers,
      revenueByDay,
    ] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(total_amount), 0)::float AS revenue,
                COUNT(*)::int AS orders
           FROM orders
          WHERE created_at >= $1
            AND LOWER(status) NOT IN ('cancelled', 'canceled')`,
        [since]
      ),
      pool.query(
        `SELECT LOWER(status) AS status, COUNT(*)::int AS count
           FROM orders
          GROUP BY LOWER(status)`
      ),
      pool.query(
        `SELECT COUNT(DISTINCT user_id)::int AS paid_customers
           FROM orders
          WHERE LOWER(status) NOT IN ('cancelled', 'canceled')`
      ),
      pool.query(
        `SELECT o.items
           FROM orders o
          WHERE LOWER(o.status) NOT IN ('cancelled', 'canceled')
            AND o.created_at >= $1`,
        [since]
      ).then((r) => {
        const tally = {};
        for (const row of r.rows) {
          let items = row.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          if (!Array.isArray(items)) continue;
          for (const it of items) {
            const pid = it.productId || it.product_id || it.id;
            const qty = Number(it.quantity || it.qty || 1);
            if (!pid) continue;
            const key = String(pid);
            if (!tally[key]) tally[key] = { productId: key, name: it.name || `SP #${key}`, sold: 0, revenue: 0 };
            tally[key].sold += qty;
            tally[key].revenue += Number(it.price || 0) * qty;
          }
        }
        const arr = Object.values(tally).sort((a, b) => b.sold - a.sold).slice(0, 8);
        return arr;
      }),
      pool.query(
        `SELECT u.id, u.name, u.email,
                COALESCE(SUM(o.total_amount), 0)::float AS total_spent,
                COUNT(o.id)::int AS orders
           FROM users u
           JOIN orders o ON o.user_id = u.id
          WHERE LOWER(o.status) NOT IN ('cancelled', 'canceled')
          GROUP BY u.id, u.name, u.email
          ORDER BY total_spent DESC
          LIMIT 8`
      ),
      pool.query(
        `SELECT DATE(created_at) AS day,
                COALESCE(SUM(total_amount), 0)::float AS revenue,
                COUNT(*)::int AS orders
           FROM orders
          WHERE created_at >= $1
            AND LOWER(status) NOT IN ('cancelled', 'canceled')
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) ASC`,
        [since]
      ),
    ]);

    res.json({
      revenue30d: revenueAgg.rows[0]?.revenue || 0,
      orders30d: revenueAgg.rows[0]?.orders || 0,
      orderStats: orderStats.rows,
      paidCustomers: customerStats.rows[0]?.paid_customers || 0,
      topProducts: topProductsResult,
      topCustomers: topCustomers.rows,
      revenueByDay: revenueByDay.rows.map((r) => ({
        day: r.day,
        revenue: r.revenue,
        orders: r.orders,
      })),
    });
  } catch (e) {
    console.error('analytics overview:', e);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// ============ REVIEWS MODERATION ============

router.get('/reviews', async (req, res) => {
  try {
    const { rating, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params = [];
    const where = [];
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      params.push(Number(rating));
      where.push(`r.rating = $${params.length}`);
    }
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      where.push(`(r.comment ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
         FROM reviews r JOIN users u ON u.id = r.user_id ${whereSql}`,
      params
    );
    const total = countResult.rows[0].total;

    params.push(Number(limit));
    params.push(offset);
    const listSql = `
      SELECT r.id, r.product_id, r.rating, r.comment, r.images,
             r.helpful_count, r.verified_purchase, r.created_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email,
             p.name AS product_name
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN products p ON p.id = r.product_id
        ${whereSql}
       ORDER BY r.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const list = await pool.query(listSql, params);

    res.json({
      items: list.rows,
      total,
      page: Number(page),
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    });
  } catch (e) {
    console.error('list reviews:', e);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('delete review:', e);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ============ USERS — Admin actions ============

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ' });
    }
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, email, name, role, has_password, created_at`,
      [role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error('update user role:', e);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ============ DASHBOARD STATS ============

router.get('/dashboard-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAgg, last7Agg, statusAgg, lowStock, recentReviews] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(total_amount), 0)::float AS revenue,
                COUNT(*)::int AS orders
           FROM orders
          WHERE created_at >= $1
            AND LOWER(status) NOT IN ('cancelled', 'canceled')`,
        [today]
      ),
      pool.query(
        `SELECT DATE(created_at) AS day,
                COALESCE(SUM(total_amount), 0)::float AS revenue,
                COUNT(*)::int AS orders
           FROM orders
          WHERE created_at >= NOW() - INTERVAL '7 days'
            AND LOWER(status) NOT IN ('cancelled', 'canceled')
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) ASC`
      ),
      pool.query(
        `SELECT LOWER(status) AS status, COUNT(*)::int AS count
           FROM orders
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY LOWER(status)`
      ),
      pool.query(
        `SELECT id, name, stock, images, category
           FROM products
          WHERE stock > 0 AND stock <= 10
          ORDER BY stock ASC
          LIMIT 8`
      ),
      pool.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                u.name AS user_name, p.name AS product_name
           FROM reviews r
           JOIN users u ON u.id = r.user_id
           LEFT JOIN products p ON p.id = r.product_id
          ORDER BY r.created_at DESC
          LIMIT 5`
      ),
    ]);

    res.json({
      today: todayAgg.rows[0] || { revenue: 0, orders: 0 },
      last7Days: last7Agg.rows,
      statusBreakdown: statusAgg.rows,
      lowStock: lowStock.rows,
      recentReviews: recentReviews.rows,
    });
  } catch (e) {
    console.error('dashboard stats:', e);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;