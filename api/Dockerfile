# ===== Runtime stage (single-stage để giảm network calls) =====
FROM node:20-slim

WORKDIR /app

# Cài deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Source code
COPY . .

# Tạo user non-root
RUN groupadd -S app && useradd -S app -G app && chown -R app:app /app
USER app

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck cho Railway
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "node scripts/initDb.js && node server.js"]
