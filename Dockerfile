# # --- build stage ---
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY . .

# # 安裝依賴並 build
# RUN npm install
# RUN npm run build

# # --- production stage ---
# FROM node:20-alpine AS runner
# WORKDIR /app

# # 安裝 production dependencies
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/package-lock.json ./
# RUN npm install --omit=dev

# # 複製 .next standalone 輸出
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/uploads ./uploads

# # optional: 靜態資源
# COPY --from=builder /app/.next/static ./.next/static

# ENV PORT=3000

# CMD ["node", "server.js"]

# --- build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# 提高 Alpine Linux 的文件描述符限制
RUN ulimit -n 65536

# 安裝依賴前先復制 package.json 和 package-lock.json
COPY package*.json ./
RUN npm ci

# 然後再複製其餘檔案
COPY . .

# 構建應用
# 增加 Node.js 的記憶體限制並設置最大舊空間大小
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# --- production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 安裝 production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev

# 複製 .next standalone 輸出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads

# 靜態資源
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]