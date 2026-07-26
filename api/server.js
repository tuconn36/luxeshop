const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const hpp = require('hpp');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

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
  delayMs: (used) => (used - 200) * 250,
});

// 4. HPP - Chống HTTP Parameter Pollution
app.use(hpp());

// 5. CORS - Cho phép nhiều domain (web + admin + localhost)
function parseOrigins() {
  const raw = process.env.CORS_ORIGIN || '';
  if (!raw) {
    return NODE_ENV === 'production'
      ? []
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://localhost:4173'];
  }
  // Hỗ trợ cả dấu phẩy và khoảng trắng
  return raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/uploads'));
app.use('/', require('./routes/sitemap'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Luxe Jewelry API',
    version: '1.0.0',
    env: NODE_ENV,
    docs: '/api',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Bind 0.0.0.0 để chạy được trong container (Railway/Render/Docker)
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT} (${NODE_ENV})`);
  console.log(`🔍 Health: /health`);
});
