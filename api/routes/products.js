const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ========== Helpers ==========

// Chuẩn hoá chuỗi tìm kiếm: bỏ dấu, bỏ ký tự đặc biệt, lower
function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tách chuỗi tìm kiếm thành các token có nghĩa (>= 2 ký tự)
function tokenizeQuery(search) {
  if (!search) return [];
  const normalized = normalizeText(search);
  if (!normalized) return [];
  return normalized.split(' ').filter((t) => t.length >= 2);
}

// Trích ảnh đầu tiên từ field images (có thể là array, JSON string, hoặc string)
function extractFirstImage(images) {
  if (!images) return '';
  if (Array.isArray(images)) return images[0] || '';
  if (typeof images === 'string') {
    try {
      const arr = JSON.parse(images);
      if (Array.isArray(arr)) return arr[0] || '';
    } catch {
      // Không phải JSON, có thể là URL đơn
      if (images.startsWith('http')) return images;
    }
  }
  return '';
}

// Lấy danh sách category trending
async function getTrendingCategories() {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM products
       GROUP BY category
       ORDER BY count DESC
       LIMIT 3`
    );
    return result.rows.map((r) => ({ name: r.category, count: parseInt(r.count) }));
  } catch {
    return [];
  }
}

// ========== Routes ==========

// GET all products with filters (smart search hỗ trợ multi-word + multi-field + ranking)
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort = '-created_at', page = 1, limit = 12 } = req.query;

    const tokens = tokenizeQuery(search);
    const useSmart = tokens.length > 0;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let p = 1;

    if (category) {
      query += ` AND category = $${p}`;
      params.push(category);
      p++;
    }

    if (brand) {
      query += ` AND tags @> $${p}`;
      params.push(JSON.stringify([brand]));
      p++;
    }

    if (minPrice) {
      query += ` AND price >= $${p}`;
      params.push(parseFloat(minPrice));
      p++;
    }

    if (maxPrice) {
      query += ` AND price <= $${p}`;
      params.push(parseFloat(maxPrice));
      p++;
    }

    // Smart search: multi-token AND, tìm trên 6 field (name, description, tags, materials, colors, sizes)
    if (useSmart) {
      const tokenClauses = tokens.map(() => {
        const cur = p++;
        return `(
          name ILIKE $${cur}
          OR description ILIKE $${cur}
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(tags::jsonb, '[]'::jsonb)) AS tag
            WHERE tag ILIKE $${cur}
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(materials::jsonb, '[]'::jsonb)) AS mat
            WHERE mat ILIKE $${cur}
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(colors::jsonb, '[]'::jsonb)) AS col
            WHERE col ILIKE $${cur}
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(sizes::jsonb, '[]'::jsonb)) AS sz
            WHERE sz ILIKE $${cur}
          )
        )`;
      });
      query += ` AND (${tokenClauses.join(' AND ')})`;
      for (const t of tokens) params.push(`%${t}%`);
    } else if (search && search.trim().length >= 1) {
      query += ` AND name ILIKE $${p}`;
      params.push(`%${search}%`);
      p++;
    }

    // Count total
    const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // ORDER BY: ranking nếu có search, ngược lại sort thường
    if (useSmart) {
      // Mỗi token: name +10, tags +5, description +1
      const parts = [];
      for (const t of tokens) {
        parts.push(`(CASE WHEN name ILIKE $${p++} THEN 10 ELSE 0 END)`);
      }
      for (const t of tokens) {
        parts.push(`(CASE WHEN EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(COALESCE(tags::jsonb, '[]'::jsonb)) AS tag
          WHERE tag ILIKE $${p++}
        ) THEN 5 ELSE 0 END)`);
      }
      for (const t of tokens) {
        parts.push(`(CASE WHEN description ILIKE $${p++} THEN 1 ELSE 0 END)`);
      }
      query += ` ORDER BY (${parts.join(' + ')}) DESC, created_at DESC`;
      // Push 3 lần cho mỗi token (name, tags, desc)
      for (let i = 0; i < 3; i++) {
        for (const t of tokens) params.push(`%${t}%`);
      }
    } else {
      const validSorts = ['created_at', 'price', 'name', '-created_at', '-price', '-name'];
      const sortField = validSorts.includes(sort) ? sort : '-created_at';
      const sortDir = sortField.startsWith('-') ? 'DESC' : 'ASC';
      const sortColumn = sortField.replace('-', '');
      query += ` ORDER BY ${sortColumn} ${sortDir}`;
    }

    const offset = (page - 1) * limit;
    query += ` LIMIT $${p} OFFSET $${p + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      items: result.rows,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      query: search || '',
      tokens,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET search suggestions (autocomplete) - top N nhanh
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q = '', limit = 8 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [], categories: [], trending: await getTrendingCategories() });
    }
    const tokens = tokenizeQuery(q);
    if (tokens.length === 0) {
      return res.json({ suggestions: [], categories: [], trending: await getTrendingCategories() });
    }

    let p = 1;
    const params = [];

    // WHERE: mỗi token match ở name, desc, hoặc tags
    const whereClauses = tokens.map(() => {
      const cur = p++;
      return `(
        name ILIKE $${cur}
        OR description ILIKE $${cur}
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(COALESCE(tags::jsonb, '[]'::jsonb)) AS tag
          WHERE tag ILIKE $${cur}
        )
      )`;
    }).join(' AND ');

    // ORDER BY: ưu tiên match ở name
    const orderParts = tokens.map(() => {
      const cur = p++;
      return `(CASE WHEN name ILIKE $${cur} THEN 1 ELSE 0 END)`;
    }).join(' + ');

    const query = `
      SELECT id, name, price, original_price, images, category
      FROM products
      WHERE ${whereClauses}
      ORDER BY (${orderParts}) DESC, created_at DESC
      LIMIT $${p}
    `;

    // Push params: 1 cho WHERE, 1 cho ORDER, cho mỗi token
    for (const t of tokens) params.push(`%${t}%`);
    for (const t of tokens) params.push(`%${t}%`);
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    // Gợi ý category phù hợp
    const categoryCounts = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM products
       WHERE name ILIKE $1 OR description ILIKE $1
       GROUP BY category
       ORDER BY count DESC
       LIMIT 3`,
      [`%${q}%`]
    );

    res.json({
      suggestions: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        originalPrice: row.original_price,
        image: extractFirstImage(row.images),
        category: row.category,
      })),
      categories: categoryCounts.rows.map((r) => ({ name: r.category, count: parseInt(r.count) })),
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ suggestions: [], categories: [], error: 'Failed' });
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

// POST create product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
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
