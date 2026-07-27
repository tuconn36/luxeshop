# ===== Build stage =====
FROM node:20-alpine AS deps
WORKDIR /app

# Cài deps production + dev (cần dev để chạy migrate nếu có)
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# ===== Runtime stage =====
FROM node:20-alpine
WORKDIR /app

# Tạo user non-root cho bảo mật
RUN addgroup -S app && adduser -S app -G app

# Copy node_modules + source từ deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set ownership cho non-root user
RUN chown -R app:app /app
USER app

# Railway sẽ tự set PORT. Mặc định 5000 cho local test.
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck không bắt buộc nhưng giúp Railway detect crash
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Khởi động: chạy migration trước, sau đó start server
CMD ["sh", "-c", "node scripts/initDb.js && node server.js"]
