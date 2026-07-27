/**
 * OTP Service - Tạo / xác thực / gửi OTP
 *
 * Tách logic OTP khỏi route để dễ maintain và test.
 * - Validate input (email/phone)
 * - Tạo mã 6 số (đỡ phải nhớ 8 số)
 * - Lưu DB với expires_at
 * - Gửi qua email hoặc SMS
 * - Rate-limit theo identifier (không cho spam)
 */

const pool = require('../config/database');
const { sendOtpEmail } = require('./mailer');
const { sendOtpSms } = require('./sms');

const EXPIRE_MINUTES = parseInt(process.env.OTP_EXPIRE_MINUTES || '10', 10);

// In-memory rate-limit: tối đa 5 OTP / 10 phút / identifier
const recentRequests = new Map(); // key: identifier, value: [timestamps]
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(identifier) {
  const now = Date.now();
  const arr = recentRequests.get(identifier) || [];
  const fresh = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recentRequests.set(identifier, fresh);
  return fresh.length >= RATE_LIMIT_MAX;
}

function recordRequest(identifier) {
  const arr = recentRequests.get(identifier) || [];
  arr.push(Date.now());
  recentRequests.set(identifier, arr);
}

function generateOtpCode() {
  // 6 chữ số (đủ an toàn, dễ nhập)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isPhone(s) {
  return typeof s === 'string' && /^\+?[0-9]{8,15}$/.test(s.replace(/\s/g, ''));
}

function normalizePhone(s) {
  // Chỉ strip whitespace, không ép +84 — để từng SMS provider tự quyết định format.
  // - Twilio: cần E.164 (+84...)
  // - eSMS.vn: cần local VN (0xxxxxxxxx)
  return String(s).replace(/\s/g, '');
}

/**
 * Tạo + gửi OTP
 * @param {{ identifier: string, method: 'email'|'phone' }} input
 */
async function createAndSendOtp({ identifier, method }) {
  if (!identifier || !method) {
    return { ok: false, status: 400, error: 'Thiếu identifier hoặc method' };
  }
  if (!['email', 'phone'].includes(method)) {
    return { ok: false, status: 400, error: 'method phải là email hoặc phone' };
  }

  let normalized = identifier.trim();
  if (method === 'email') {
    if (!isEmail(normalized)) {
      return { ok: false, status: 400, error: 'Email không hợp lệ' };
    }
    normalized = normalized.toLowerCase();
  } else {
    if (!isPhone(normalized)) {
      return { ok: false, status: 400, error: 'Số điện thoại không hợp lệ' };
    }
    normalized = normalizePhone(normalized);
  }

  if (isRateLimited(normalized)) {
    return {
      ok: false,
      status: 429,
      error: `Bạn đã yêu cầu quá nhiều mã. Vui lòng đợi ${RATE_LIMIT_WINDOW_MS / 60000} phút.`,
    };
  }

  // Xoá các OTP cũ chưa verify của identifier để tránh nhiều mã song song
  await pool.query('DELETE FROM otp_codes WHERE identifier = $1 AND verified = FALSE', [normalized]);

  const code = generateOtpCode();
  const otpId = `otp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_codes (otp_id, code, identifier, method, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [otpId, code, normalized, method, expiresAt]
  );

  recordRequest(normalized);

  // Gửi qua kênh tương ứng
  let delivery;
  if (method === 'email') {
    delivery = await sendOtpEmail(normalized, code);
  } else {
    delivery = await sendOtpSms(normalized, code);
  }

  // Không trả code ra response khi đã gửi thật (chỉ trả trong dev-fallback)
  const response = {
    otpId,
    message: delivery.ok
      ? `Đã gửi mã OTP đến ${method === 'email' ? 'email' : 'số điện thoại'} của bạn`
      : 'Không gửi được OTP, vui lòng thử lại sau',
    method,
    expiresInMinutes: EXPIRE_MINUTES,
    channel: delivery.channel,
  };

  // Trong dev-fallback (không có SMTP), cho trả code để dev dễ test
  if (delivery.channel === 'dev-log' || delivery.channel === 'fallback-log') {
    response._devOtp = code;
  }

  // Nếu gửi thất bại → trả lỗi 502
  if (!delivery.ok && delivery.channel !== 'fallback-log') {
    return { ok: false, status: 502, error: 'Gửi OTP thất bại', detail: delivery.error };
  }

  return { ok: true, status: 200, data: response };
}

/**
 * Verify OTP
 * @param {{ otpId: string, code: string }} input
 */
async function verifyOtp({ otpId, code }) {
  if (!otpId || !code) {
    return { ok: false, status: 400, error: 'Thiếu otpId hoặc code' };
  }

  const result = await pool.query(
    'SELECT * FROM otp_codes WHERE otp_id = $1 AND verified = FALSE',
    [otpId]
  );

  if (result.rows.length === 0) {
    return { ok: false, status: 400, error: 'Mã OTP không tồn tại hoặc đã dùng' };
  }

  const otp = result.rows[0];

  if (new Date() > new Date(otp.expires_at)) {
    await pool.query('DELETE FROM otp_codes WHERE otp_id = $1', [otpId]);
    return { ok: false, status: 400, error: 'Mã OTP đã hết hạn' };
  }

  if (otp.code !== code) {
    return { ok: false, status: 400, error: 'Mã OTP không đúng' };
  }

  await pool.query('UPDATE otp_codes SET verified = TRUE WHERE otp_id = $1', [otpId]);

  return { ok: true, status: 200, data: { otpId, identifier: otp.identifier, method: otp.method } };
}

module.exports = { createAndSendOtp, verifyOtp };