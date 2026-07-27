const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');

const pool = require('./config/database');

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

require('dotenv').config();

const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  'https://luxeshop-six.vercel.app',
  'https://www.luxeshop-six.vercel.app',
  'https://luxeadmin.vercel.app',
  'https://www.luxeadmin.vercel.app',
];

const HOST = process.env.HOST || '0.0.0.0';
// Khi start locally (npm run dev) ưu tiên 5001 cho khớp với web/.env,
// tránh xung đột với các API khác đang dùng 5000.
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Nếu không set CORS_ORIGIN và đang production → dùng danh sách mặc định
// (tránh vô tình đóng CORS khi deploy mà quên set env).
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
  : (NODE_ENV === 'production' ? DEFAULT_ALLOWED_ORIGINS : []);

console.log('PORT ENV =', process.env.PORT);
console.log('PORT USED =', PORT);
console.log('CORS allowed origins =', allowedOrigins);
// ============ TRUST PROXY ============
// Railway / Render / Nginx / Cloudflare đều chạy qua reverse proxy.
// Cần bật trust proxy để express-rate-limit dùng đúng IP thật của client.
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust 1 hop (đủ cho Railway/Render/Nginx)
}

// ============ SECURITY MIDDLEWARE ============

// 1. Helmet - HTTP Security Headers (tắt CSP ở API vì API không serve HTML)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// 2. Rate Limiting - Giới hạn số request API trên production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 500,
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit cho auth routes (nghiêm ngặt hơn)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Quá nhiều lần thử, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Slow Down - Làm chậm khi có quá nhiều request
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 200,
  delayMs: () => 250,
  validate: { delayMs: false },
});

// 4. HPP - Chống HTTP Parameter Pollution
app.use(hpp());

// 5. CORS - Cho phép nhiều domain (web + admin + localhost)
function parseOrigins() {
  // Đã được resolve sẵn ở trên (allowedOrigins)
  return allowedOrigins;
}

const corsOptions = {
  origin(origin, callback) {
    const allowed = parseOrigins();
    // Cho phép request không có Origin (mobile app, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowed.length === 0) return callback(null, true);
    if (allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Chỉ giới hạn lưu lượng public trên production. Nếu bật ở development,
// HMR và React StrictMode có thể dùng hết quota rồi làm mọi API trả 429.
if (NODE_ENV === 'production') {
  app.use('/api', limiter);
  app.use('/api', speedLimiter);
}
app.use('/api/auth', authLimiter);

// ============ MIDDLEWARE ============

// Set UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/', require('./routes/sitemap'));

// Health check - respond immediately, no DB call, no rate-limit dependency
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Luxe Jewelry API',
    version: '1.0.0',
    env: NODE_ENV,
    docs: '/api',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'Luxe Jewelry API',
    version: '1.0.0',
    auth: {
      requestOtp: 'POST /api/auth/request-otp',
      verifyOtp: 'POST /api/auth/verify-otp',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      setPassword: 'POST /api/auth/set-password',
      changePassword: 'POST /api/auth/change-password',
      checkAuthMethod: 'POST /api/auth/check-auth-method',
    },
    products: {
      list: 'GET /api/products?category=&brand=&minPrice=&maxPrice=&search=&sort=&page=&limit=',
      suggestions: 'GET /api/products/search/suggestions?q=&limit=',
      get: 'GET /api/products/:id',
      create: 'POST /api/products (admin)',
      update: 'PUT /api/products/:id (admin)',
      delete: 'DELETE /api/products/:id (admin)',
    },
    orders: {
      listAll: 'GET /api/orders/all (admin)',
      byUser: 'GET /api/orders/user/:userId',
      get: 'GET /api/orders/:id',
      create: 'POST /api/orders',
      cancel: 'POST /api/orders/:id/cancel (user, own order)',
      updateStatus: 'PUT /api/orders/:id/status (admin)',
    },
    reviews: {
      byProduct: 'GET /api/reviews/product/:productId',
      create: 'POST /api/reviews',
      helpful: 'POST /api/reviews/:id/helpful',
      delete: 'DELETE /api/reviews/:id (auth)',
    },
    users: {
      get: 'GET /api/users/:id',
      update: 'PUT /api/users/:id (owner/admin)',
      avatar: 'POST /api/users/:id/avatar (owner/admin)',
      addresses: 'GET/POST/PUT/DELETE /api/users/:id/addresses[/:addressId]',
      setDefaultAddress: 'PUT /api/users/:id/addresses/:addressId/default',
      measurements: 'GET/PUT /api/users/:id/measurements',
      stats: 'GET /api/users/:id/stats',
    },
    wishlist: {
      get: 'GET /api/wishlist',
      add: 'POST /api/wishlist',
      remove: 'DELETE /api/wishlist/:productId',
    },
    payment: {
      sepayWebhook: 'POST /api/payment/sepay-webhook',
    },
    uploads: {
      image: 'POST /api/upload/image',
    },
    admin: {
      categories: 'GET/POST /api/admin/categories, PUT/DELETE /api/admin/categories/:id',
      promotions: 'GET/POST /api/admin/promotions, PUT/DELETE /api/admin/promotions/:id',
      banners: 'GET/POST /api/admin/banners, PUT/DELETE /api/admin/banners/:id',
      settings: 'GET/PUT /api/admin/settings',
      reviews: 'GET/DELETE /api/admin/reviews[/:id]',
      analyticsOverview: 'GET /api/admin/analytics/overview',
      dashboardStats: 'GET /api/admin/dashboard-stats',
      updateUserRole: 'PUT /api/admin/users/:id/role',
    },
    notes: [
      'Tất cả endpoints /api/admin yêu cầu JWT admin role.',
      'Đăng nhập qua /api/auth/login → lấy token → gửi Bearer token.',
      'Mọi response lỗi có dạng { error: string }.',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Lỗi CORS từ cors() thường đi vào đây khi origin bị reject.
  // Trả 403 thay vì 500 để client thấy đúng bản chất lỗi.
  if (err && typeof err.message === 'string' && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// Bind 0.0.0.0 để chạy được trong container (Railway/Render/Docker)
// (HOST đã được khai báo ở đầu file)
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT} (${NODE_ENV})`);
  console.log(`🔍 Health: /health`);
});
