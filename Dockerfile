# --- build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .

# 安裝依賴並 build
RUN npm install
COPY .env ./
RUN npm run build

# --- production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 安裝 production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.env ./
RUN npm install --omit=dev

# 複製 .next standalone 輸出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads

# optional: 靜態資源
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000

CMD ["node", "server.js"]
