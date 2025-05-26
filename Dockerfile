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

# 啟用 corepack 並啟用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 複製檔案並安裝依賴、build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# --- production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 再次啟用 pnpm（有些 base image 不會繼承）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 複製必要檔案與 production 安裝
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 複製 standalone Next.js 產出（包含 server.js）
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
CMD ["node", "server.js"]