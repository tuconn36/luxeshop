FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
EXPOSE 5000

RUN node -e "console.log('Build OK: node', process.versions.node)"

CMD ["node", "server.js"]
