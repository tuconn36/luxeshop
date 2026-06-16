const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET user profile
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, phone, address, avatar, created_at FROM users WHERE id = $1',
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

// PUT update user profile
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const result = await pool.query(
      `UPDATE users SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING id, email, name, phone, address, avatar, created_at`,
      [name, phone, address, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
