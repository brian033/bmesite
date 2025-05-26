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
FROM node:20 AS builder
WORKDIR /app

# 啟用 corepack 並啟用 pnpm（Node 20 預裝 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 複製必要檔案
COPY . .

# 將 cache 資料夾設定為可掛載（選用）
VOLUME ["/app/.next/cache", "/app/node_modules/.cache"]

# 安裝依賴
RUN pnpm install --frozen-lockfile

# Build Next.js (會輸出 .next/standalone)
RUN pnpm run build

# --- production stage ---
FROM node:20 AS runner
WORKDIR /app

# 啟用 corepack 並啟用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 複製必要檔案
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# 安裝 production-only dependencies
RUN pnpm install --prod --frozen-lockfile

# 複製 build 輸出與靜態檔案
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
CMD ["node", "server.js"]