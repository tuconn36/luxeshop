const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// =====================================================
// Cấu hình ngân hàng nhận tiền — điền trong .env
// Mặc định hiển thị Vietcombank, MbBank, Techcombank nếu chưa config.
// Bạn có thể ẩn/bật từng NH bằng cách set flag enable=false trong env.
// =====================================================
function buildBankList() {
  const banks = [
    {
      id: 'vcb',
      name: 'Vietcombank',
      shortName: 'VCB',
      logo: 'https://api.vietqr.io/img/vcb.png',
      accountNumber: process.env.BANK_VCB_ACCOUNT || '',
      accountName: process.env.BANK_VCB_NAME || 'LUXE FASHION',
      enabled: process.env.BANK_VCB_ENABLED !== 'false',
    },
    {
      id: 'mb',
      name: 'MbBank',
      shortName: 'MB',
      logo: 'https://api.vietqr.io/img/mb.png',
      accountNumber: process.env.BANK_MB_ACCOUNT || '',
      accountName: process.env.BANK_MB_NAME || 'LUXE FASHION',
      enabled: process.env.BANK_MB_ENABLED !== 'false',
    },
    {
      id: 'tcb',
      name: 'Techcombank',
      shortName: 'TCB',
      logo: 'https://api.vietqr.io/img/tcb.png',
      accountNumber: process.env.BANK_TCB_ACCOUNT || '',
      accountName: process.env.BANK_TCB_NAME || 'LUXE FASHATION',
      enabled: process.env.BANK_TCB_ENABLED !== 'false',
    },
  ];
  // Chỉ trả về NH đang bật + đã có số tài khoản
  return banks
    .filter((b) => b.enabled && b.accountNumber)
    .map((b) => ({
      id: b.id,
      name: b.name,
      shortName: b.shortName,
      logo: b.logo,
      accountNumber: b.accountNumber,
      accountName: b.accountName,
    }));
}

// GET /api/payment/banks — danh sách NH đang bật
router.get('/banks', async (req, res) => {
  try {
    const banks = buildBankList();
    if (banks.length === 0) {
      return res.status(503).json({
        error: 'Chưa cấu hình tài khoản ngân hàng. Vui lòng liên hệ admin.',
        banks: [],
      });
    }
    res.json({ banks });
  } catch (err) {
    console.error('Get banks error:', err);
    res.status(500).json({ error: 'Failed to load banks' });
  }
});

// =====================================================
// Sinh QR động từ VietQR API (vietqr.io)
// GET /api/payment/qr?orderId=123&bankId=vcb
// Trả về: { qrUrl, content, amount, bank: {...} }
// =====================================================
router.get('/qr', async (req, res) => {
  try {
    const orderId = parseInt(req.query.orderId, 10);
    const bankId = (req.query.bankId || '').toLowerCase();

    if (!orderId || !bankId) {
      return res.status(400).json({ error: 'orderId và bankId là bắt buộc' });
    }

    // Lấy thông tin đơn hàng
    const orderRes = await pool.query(
      `SELECT id, total_amount, payment_method, payment_status, status
       FROM orders WHERE id = $1`,
      [orderId]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    const order = orderRes.rows[0];

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Đơn hàng đã được thanh toán' });
    }

    // Tìm NH theo id
    const banks = buildBankList();
    const bank = banks.find((b) => b.id === bankId);
    if (!bank) {
      return res.status(404).json({ error: 'Ngân hàng không hỗ trợ' });
    }

    const amount = Number(order.total_amount);
    // Nội dung CK: LUXE + 6 ký tự cuối của order id (viết hoa, không dấu, không khoảng trắng)
    const orderCode = `LUXE${String(order.id).slice(-6).toUpperCase().padStart(6, '0')}`;
    const content = orderCode;

    // VietQR API: GET https://api.vietqr.io/image/{bank_id}/{account_no}?amount=...&addInfo=...&accountName=...
    // Template: compact hoặc print. compact2 ~ vuông, dễ hiển thị.
    const params = new URLSearchParams({
      amount: String(Math.round(amount)),
      addInfo: content,
      accountName: bank.accountName,
    });
    const qrUrl = `https://img.vietqr.io/image/${bank.id}-${bank.accountNumber}-compact2.png?${params.toString()}`;

    // Cũng có thể dùng API tạo QR dạng data URL:
    // https://api.vietqr.io/v2/generate — trả về qrDataURL

    res.json({
      qrUrl,
      content,
      amount,
      bank: {
        id: bank.id,
        name: bank.name,
        accountNumber: bank.accountNumber,
        accountName: bank.accountName,
      },
    });
  } catch (err) {
    console.error('Get QR error:', err);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

// =====================================================
// POST /api/payment/sepay-webhook
// Sepay sẽ gọi vào đây khi có giao dịch CK vào TK ngân hàng.
// Payload Sepay: { id, gateway, transactionDate, accountNumber, content,
//                  transferType, transferAmount, ... }
// =====================================================
router.post('/sepay-webhook', async (req, res) => {
  try {
    const data = req.body || {};

    // Sepay gửi khá nhiều trường. Tùy version, dùng field "content" làm nội dung CK.
    // Sepay cũng có api_key trong header (Authorization: Apikey <KEY>) — verify nếu đã cấu hình.
    const apiKey = process.env.SEPAY_API_KEY;
    if (apiKey) {
      const headerKey = req.headers['authorization']?.replace(/^Apikey\s+/i, '').trim()
        || req.headers['x-api-key'];
      if (headerKey !== apiKey) {
        console.warn('Sepay webhook: invalid API key');
        return res.status(401).json({ error: 'Invalid API key' });
      }
    }

    const content = String(data.content || data.description || '').trim();
    const amount = Number(data.transferAmount || data.amount || 0);

    if (!content) {
      return res.status(400).json({ error: 'Missing content' });
    }

    // Parse mã đơn từ content — chấp nhận các biến thể:
    //   LUXE000123   / LUXE 000123 / DH000123 / LUXE123
    const match = content.match(/(?:LUXE|DH)\s*0*(\d+)/i);
    if (!match) {
      console.warn('Sepay webhook: cannot parse order code from content:', content);
      return res.json({ success: false, reason: 'no_order_code_in_content' });
    }

    const orderId = parseInt(match[1], 10);
    if (!orderId) {
      return res.json({ success: false, reason: 'invalid_order_code' });
    }

    // Lấy đơn để verify số tiền
    const orderRes = await pool.query(
      `SELECT id, total_amount, payment_status FROM orders WHERE id = $1`,
      [orderId]
    );
    if (orderRes.rows.length === 0) {
      console.warn(`Sepay webhook: order ${orderId} not found`);
      return res.json({ success: false, reason: 'order_not_found' });
    }
    const order = orderRes.rows[0];

    if (order.payment_status === 'paid') {
      // Idempotent — Sepay có thể gọi lại
      return res.json({ success: true, idempotent: true });
    }

    // So khớp số tiền (cho phép lệch ±1000đ do bank làm tròn)
    const orderAmount = Number(order.total_amount);
    if (Math.abs(amount - orderAmount) > 1000) {
      console.warn(
        `Sepay webhook: amount mismatch for order ${orderId}: ` +
        `expected ${orderAmount}, got ${amount}`
      );
      return res.json({ success: false, reason: 'amount_mismatch' });
    }

    // Cập nhật: payment_status='paid', status='processing' (chuyển từ pending_payment)
    await pool.query(
      `UPDATE orders
       SET payment_status = 'paid',
           status = CASE WHEN status = 'pending_payment' THEN 'processing' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );

    console.log(`Sepay webhook: order ${orderId} marked paid (${amount} VND)`);
    res.json({ success: true, orderId, amount });
  } catch (err) {
    console.error('Sepay webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// =====================================================
// POST /api/payment/orders/:id/mark-paid
// Cho phép user bấm "Tôi đã CK xong" — KHÔNG tự động đổi sang paid.
// Chỉ ghi log để admin dễ đối soát; thanh toán thật sự vẫn chờ Sepay webhook.
// Body optional: { note }
// =====================================================
router.post('/orders/:id/mark-paid', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!orderId) return res.status(400).json({ error: 'Invalid orderId' });

    const orderRes = await pool.query(
      `SELECT id, user_id, payment_status FROM orders WHERE id = $1`,
      [orderId]
    );
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderRes.rows[0].payment_status === 'paid') {
      return res.json({ success: true, alreadyPaid: true });
    }

    // Cập nhật flag "user đã xác nhận" vào notes (KHÔNG đổi payment_status)
    const userNote = '[User xác nhận đã CK]';
    await pool.query(
      `UPDATE orders
       SET notes = CASE
         WHEN notes IS NULL OR notes = '' THEN $1
         WHEN notes LIKE '%' || $1 || '%' THEN notes
         ELSE notes || E'\\n' || $1
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [userNote, orderId]
    );

    res.json({ success: true, message: 'Đã ghi nhận. Đơn sẽ được xử lý khi xác nhận thanh toán.' });
  } catch (err) {
    console.error('Mark paid error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;