const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort = 'created_at', page = 1, limit = 12 } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Count total
    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    const validSorts = ['created_at', 'price', 'name', '-created_at', '-price', '-name'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortDir = sortField.startsWith('-') ? 'DESC' : 'ASC';
    const sortColumn = sortField.replace('-', '');
    
    query += ` ORDER BY ${sortColumn} ${sortDir}`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      items: result.rows,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product (admin only - add auth middleware later)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, original_price, category, stock, featured, images, materials, sizes, colors, tags } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, original_price, category, stock, featured, images, materials, sizes, colors, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, description, price, original_price, category, stock, featured, JSON.stringify(images), JSON.stringify(materials), JSON.stringify(sizes), JSON.stringify(colors), JSON.stringify(tags)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, original_price, category, stock, featured, images, materials, sizes, colors, tags } = req.body;

    const result = await pool.query(
      `UPDATE products SET 
        name = $1, description = $2, price = $3, original_price = $4, 
        category = $5, stock = $6, featured = $7, images = $8, 
        materials = $9, sizes = $10, colors = $11, tags = $12, 
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
      [name, description, price, original_price, category, stock, featured, JSON.stringify(images), JSON.stringify(materials), JSON.stringify(sizes), JSON.stringify(colors), JSON.stringify(tags), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
