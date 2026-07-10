const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { createAndSendOtp, verifyOtp } = require('../lib/otpService');

// Request OTP (gửi qua email hoặc SMS thật, xem lib/otpService.js)
router.post('/request-otp', async (req, res) => {
  const result = await createAndSendOtp(req.body || {});
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error, detail: result.detail });
  }
  res.json(result.data);
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const verify = await verifyOtp(req.body || {});
    if (!verify.ok) return res.status(verify.status).json({ error: verify.error });

    const { identifier, method } = verify.data;
    const field = method === 'email' ? 'email' : 'phone';

    let result = await pool.query(`SELECT * FROM users WHERE ${field} = $1`, [identifier]);
    let user;
    let isNewUser = false;
    let needsPassword = false;

    if (result.rows.length === 0) {
      isNewUser = true;
      needsPassword = true;
      const userName = method === 'email'
        ? identifier.split('@')[0]
        : `User_${identifier.slice(-4)}`;

      const dummyHash = await bcrypt.hash(`__otp_placeholder__`, 10);

      if (method === 'email') {
        result = await pool.query(
          `INSERT INTO users (email, password_hash, name, has_password, created_at) VALUES ($1, $2, $3, FALSE, NOW()) RETURNING *`,
          [identifier, dummyHash, userName]
        );
      } else {
        const placeholderEmail = `${identifier.replace(/[^0-9]/g, '')}@phone.luxe.vn`;
        result = await pool.query(
          `INSERT INTO users (email, phone, password_hash, name, has_password, created_at) VALUES ($1, $2, $3, $4, FALSE, NOW()) RETURNING *`,
          [placeholderEmail, identifier, dummyHash, userName]
        );
      }
      user = result.rows[0];
    } else {
      user = result.rows[0];
      needsPassword = !user.has_password;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;

    res.json({ user, token, isNewUser, needsPassword });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, has_password) VALUES ($1, $2, $3, TRUE) RETURNING id, email, name, created_at',
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login with email + password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Trước đây hardcode admin@luxe.vn/admin123 trả về user fake id=1 — bug này đã sửa.
    // Bây giờ đăng nhập hoàn toàn qua DB + bcrypt. Admin phải được tạo qua createAdmin script.
    const isValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Set password after OTP (marks has_password = TRUE)
router.post('/set-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, has_password = TRUE WHERE id = $2',
      [passwordHash, payload.userId]
    );

    res.json({ message: 'Mật khẩu đã được cập nhật' });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Check auth method for identifier
router.post('/check-auth-method', async (req, res) => {
  try {
    const { identifier, method } = req.body;
    const field = method === 'email' ? 'email' : 'phone';
    const result = await pool.query(`SELECT has_password FROM users WHERE ${field} = $1`, [identifier]);

    if (result.rows.length === 0) {
      return res.json({ exists: false, hasPassword: false });
    }

    res.json({ exists: true, hasPassword: !!result.rows[0].has_password });
  } catch (error) {
    console.error('Error checking auth method:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password (requires current password)
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const result = await pool.query('SELECT password_hash, has_password FROM users WHERE id = $1', [payload.userId]);
    const user = result.rows[0];

    // If user has a password, verify current password
    if (user.has_password) {
      if (!currentPassword) return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại' });
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, has_password = TRUE WHERE id = $2',
      [passwordHash, payload.userId]
    );

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
