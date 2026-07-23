const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

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

    // Đơn thanh toán QR sẽ ở trạng thái chờ CK cho đến khi Sepay webhook xác nhận.
    // Đơn COD giữ nguyên 'pending' (chờ xác nhận).
    const initialStatus = payment_method === 'vietqr' ? 'pending_payment' : 'pending';
    // payment_status: QR là 'pending' (chờ CK), các method khác cũng 'pending' cho tới khi xác nhận.
    const initialPaymentStatus = 'pending';

    const result = await pool.query(
      `INSERT INTO orders (user_id, items, total_amount, shipping_address, payment_method, status, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, JSON.stringify(items), total_amount, JSON.stringify(shipping_address), payment_method, initialStatus, initialPaymentStatus, notes]
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

// POST cancel order (user) — đặt TRƯỚC PUT /:id/status để tránh bị trùng pattern.
// Chỉ cho phép user hủy đơn của chính họ, và chỉ khi đơn còn ở trạng thái
// "pending" / "pending_payment" / "processing". Không cho hủy khi đã giao/đang giao/đã hủy.
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!orderId) return res.status(400).json({ error: 'Invalid orderId' });

    const orderRes = await pool.query(
      'SELECT id, user_id, status FROM orders WHERE id = $1',
      [orderId]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderRes.rows[0];

    // Đúng chủ đơn?
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden - Not your order' });
    }

    // Chỉ cho hủy khi đơn chưa vận chuyển
    const cancellable = ['pending', 'pending_payment', 'processing', 'ready'];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        error: `Không thể hủy đơn ở trạng thái "${order.status}"`,
        currentStatus: order.status,
      });
    }

    const cancelNote = `[User hủy đơn lúc ${new Date().toISOString()}]`;
    const result = await pool.query(
      `UPDATE orders
       SET status = 'cancelled',
           notes = CASE
             WHEN notes IS NULL OR notes = '' THEN $1
             WHEN notes LIKE '%' || $1 || '%' THEN notes
             ELSE notes || E'\n' || $1
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, user_id, items, total_amount, status, shipping_address,
                 payment_method, payment_status, notes, tracking_number,
                 created_at, updated_at`,
      [cancelNote, orderId]
    );

    const r = result.rows[0];
    res.json({
      success: true,
      order: {
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
      },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
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
