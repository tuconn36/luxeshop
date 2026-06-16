const express = require('express');
const router = express.Router();
const pool = require('../config/database');

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

// POST create review
router.post('/', async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [product_id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, user_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
