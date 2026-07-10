const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all orders (admin) — phải đặt TRƯỚC /:id để tránh Express match nhầm 'all' thành id.
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, items, total_amount, status, shipping_address,
              payment_method, payment_status, notes, tracking_number,
              created_at, updated_at
       FROM orders ORDER BY created_at DESC LIMIT 200`
    );
    const rows = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      items: r.items,
      totalPrice: Number(r.total_amount),
      status: r.status,
      shippingAddress: r.shipping_address,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      notes: r.notes,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, items, total_amount, status, shipping_address,
              payment_method, payment_status, notes, tracking_number,
              created_at, updated_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    // Map snake_case -> camelCase để frontend dễ dùng
    const rows = result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      items: r.items,
      totalPrice: Number(r.total_amount),
      status: r.status,
      shippingAddress: r.shipping_address,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      notes: r.notes,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      userId: r.user_id,
      items: r.items,
      totalPrice: Number(r.total_amount),
      status: r.status,
      shippingAddress: r.shipping_address,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      notes: r.notes,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create order
router.post('/', async (req, res) => {
  try {
    const { user_id, items, total_amount, shipping_address, payment_method, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO orders (user_id, items, total_amount, shipping_address, payment_method, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING *`,
      [user_id, JSON.stringify(items), total_amount, JSON.stringify(shipping_address), payment_method, notes]
    );

    const r = result.rows[0];
    res.status(201).json({
      id: r.id,
      userId: r.user_id,
      items: r.items,
      totalPrice: Number(r.total_amount),
      status: r.status,
      shippingAddress: r.shipping_address,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      notes: r.notes,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, tracking_number } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, tracking_number = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, tracking_number, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
