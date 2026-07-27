FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

# Railway sẽ set PORT từ env (mặc định 8080 nếu không set)
# Code sẽ listen theo PORT, EXPOSE chỉ để document
CMD ["node", "server.js"]