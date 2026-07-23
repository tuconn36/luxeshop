const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware xác thực token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra user có tồn tại không
    // COALESCE(role, 'user') để an toàn khi DB chưa chạy migration thêm cột role.
    const result = await pool.query(
      'SELECT id, email, COALESCE(role, $2) AS role FROM users WHERE id = $1',
      [payload.userId, 'user']
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    const row = result.rows[0];
    // Gắn cả `id` lẫn `userId` để tương thích code dùng cả 2 kiểu (wishlist.js, ownerOrAdminMiddleware).
    req.user = { id: row.id, userId: row.id, email: row.email, role: row.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware kiểm tra quyền admin
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
};

// Middleware kiểm tra quyền owner hoặc admin
const ownerOrAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Cho phép admin hoặc chính chủ user truy cập
  if (req.user.role === 'admin' || req.user.id === parseInt(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden - Access denied' });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  ownerOrAdminMiddleware
};
