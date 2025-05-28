# --- build stage ---
FROM node:20 AS builder
WORKDIR /app

# 接收從 build args 傳進來的參數
ARG MONGODB_URI
ARG MONGODB_DB

# 設定成環境變數，讓 node.js 可以讀到 process.env.*
ENV MONGODB_URI=$MONGODB_URI
ENV MONGODB_DB=$MONGODB_DB

COPY . .

# 安裝依賴並 build
RUN npm install
RUN npm run build

# --- production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 安裝 production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm install --omit=dev

# 複製 .next standalone 輸出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads

# optional: 靜態資源
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000

CMD ["node", "server.js"]
