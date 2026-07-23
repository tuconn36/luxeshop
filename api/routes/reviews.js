const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

// Multer config for review images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/reviews');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `review_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// GET reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST create review (with optional images)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [product_id, user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // Check verified purchase
    const purchase = await pool.query(
      `SELECT id FROM orders 
       WHERE user_id = $1 AND status = 'delivered'
       AND items @> $2`,
      [user_id, JSON.stringify([{ productId: parseInt(product_id) }])]
    );
    const verified = purchase.rows.length > 0;

    // Build image URLs
    const imageUrls = (req.files || []).map(f => `/uploads/reviews/${f.filename}`);

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, images, verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_id, user_id, rating, comment, JSON.stringify(imageUrls), verified]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// POST mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING helpful_count',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ helpful_count: result.rows[0].helpful_count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update helpful count' });
  }
});

// DELETE review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
