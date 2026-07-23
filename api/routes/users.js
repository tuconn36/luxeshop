const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware, ownerOrAdminMiddleware } = require('../middleware/auth');

// Multer config — lưu vào api/uploads/avatars/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// GET all users (admin) — dùng regex để chỉ match /all, không bị /:id nuốt mất
// Đặt TRƯỚC route /:id vì Express match theo thứ tự đăng ký.
router.get(/^\/all$/, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, address, dob, avatar, has_password, shipping_address, created_at FROM users ORDER BY created_at DESC LIMIT 200'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user profile
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, address, dob, avatar, has_password, shipping_address, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT update user profile (owner or admin)
router.put('/:id', authMiddleware, ownerOrAdminMiddleware, async (req, res) => {
  try {
    const { name, phone, address, dob, avatar, shipping_address } = req.body;

    const result = await pool.query(
      `UPDATE users SET 
        name = $1, 
        phone = $2, 
        address = $3, 
        dob = $4,
        avatar = COALESCE($5, avatar),
        shipping_address = COALESCE($6, shipping_address),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING id, email, name, phone, address, dob, avatar, has_password, shipping_address, created_at`,
      [name, phone, address, dob || null, avatar || null, shipping_address ? JSON.stringify(shipping_address) : null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user — full error:', error);
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// POST upload avatar (owner or admin)
router.post('/:id/avatar', authMiddleware, ownerOrAdminMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Không có file' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const result = await pool.query(
      'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, avatar',
      [avatarUrl, req.params.id]
    );

    res.json({ avatar: result.rows[0].avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: error.message || 'Failed to upload avatar' });
  }
});

// =================== ADDRESSES ===================
// Lấy tất cả địa chỉ của user
router.get('/:id/addresses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    // Table may not exist yet — return empty array gracefully
    if (error.code === '42P01') return res.json([]);
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Tạo địa chỉ mới
router.post('/:id/addresses', async (req, res) => {
  try {
    const { name, phone, address, city, district, is_default } = req.body;

    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [req.params.id]);
    }

    // Đảm bảo bảng tồn tại
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100),
        district VARCHAR(100),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      `INSERT INTO user_addresses (user_id, name, phone, address, city, district, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, name, phone, address, city || null, district || null, !!is_default]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: error.message || 'Failed to create address' });
  }
});

// Cập nhật địa chỉ
router.put('/:id/addresses/:addressId', async (req, res) => {
  try {
    const { name, phone, address, city, district, is_default } = req.body;

    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [req.params.id]);
    }

    const result = await pool.query(
      `UPDATE user_addresses SET name = $1, phone = $2, address = $3, city = $4, district = $5, is_default = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [name, phone, address, city || null, district || null, !!is_default, req.params.addressId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: error.message || 'Failed to update address' });
  }
});

// Xóa địa chỉ
router.delete('/:id/addresses/:addressId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.addressId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: error.message || 'Failed to delete address' });
  }
});

// Đặt địa chỉ mặc định
router.put('/:id/addresses/:addressId/default', async (req, res) => {
  try {
    await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [req.params.id]);
    const result = await pool.query(
      'UPDATE user_addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.addressId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ error: error.message || 'Failed to set default' });
  }
});

// =================== MEASUREMENTS ===================
router.get('/:id/measurements', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_measurements (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        height NUMERIC(5,1),
        weight NUMERIC(5,1),
        chest NUMERIC(5,1),
        waist NUMERIC(5,1),
        hip NUMERIC(5,1),
        shoulder NUMERIC(5,1),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query('SELECT * FROM user_measurements WHERE user_id = $1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});

router.put('/:id/measurements', async (req, res) => {
  try {
    const { height, weight, chest, waist, hip, shoulder } = req.body;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_measurements (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        height NUMERIC(5,1),
        weight NUMERIC(5,1),
        chest NUMERIC(5,1),
        waist NUMERIC(5,1),
        hip NUMERIC(5,1),
        shoulder NUMERIC(5,1),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      `INSERT INTO user_measurements (user_id, height, weight, chest, waist, hip, shoulder, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         height = EXCLUDED.height,
         weight = EXCLUDED.weight,
         chest = EXCLUDED.chest,
         waist = EXCLUDED.waist,
         hip = EXCLUDED.hip,
         shoulder = EXCLUDED.shoulder,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.id, height || null, weight || null, chest || null, waist || null, hip || null, shoulder || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving measurements:', error);
    res.status(500).json({ error: error.message || 'Failed to save measurements' });
  }
});

// =================== USER STATS ===================
// Đếm số đơn theo trạng thái để hiển thị ở sidebar
router.get('/:id/stats', async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM orders WHERE user_id = $1 GROUP BY status`,
      [req.params.id]
    );

    const counts = {
      all: 0,
      pending: 0,
      processing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const row of ordersResult.rows) {
      counts.all += row.count;
      const s = (row.status || '').toLowerCase();
      if (counts[s] !== undefined) counts[s] += row.count;
      else if (s === 'chờ xác nhận' || s === 'pending') counts.pending += row.count;
      else if (s === 'đang xử lý' || s === 'processing') counts.processing += row.count;
      else if (s === 'đang giao' || s === 'shipping' || s === 'shipped') counts.shipping += row.count;
      else if (s === 'đã giao' || s === 'delivered') counts.delivered += row.count;
      else if (s === 'đã hủy' || s === 'cancelled' || s === 'canceled') counts.cancelled += row.count;
    }

    const addressesResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM user_addresses WHERE user_id = $1',
      [req.params.id]
    ).catch(() => ({ rows: [{ count: 0 }] }));

    res.json({
      orders: counts,
      addresses: addressesResult.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Trả về 0 để frontend vẫn hoạt động
    res.json({
      orders: { all: 0, pending: 0, processing: 0, shipping: 0, delivered: 0, cancelled: 0 },
      addresses: 0,
    });
  }
});

module.exports = router;
