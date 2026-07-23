const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT w.id, w.created_at, p.*
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Already in wishlist' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    res.json({ inWishlist: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
});

module.exports = router;
