#!/bin/bash

# --- 檢查是否提供密碼參數 ---
if [ -z "$1" ]; then
  echo "❌ 錯誤：請提供 MongoDB 密碼作為參數。"
  echo "📖 用法: bash $0 <mongo_password>"
  exit 1
fi

# --- 帳號密碼變數 ---
MONGO_PASS="$1"
MONGO_USER="admin"
AUTH_DB="admin"

# --- 時間戳記 + 備份路徑 ---
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="../backup/$DATE"
mkdir -p "$BACKUP_DIR" || { echo "❌ 無法創建備份目錄: $BACKUP_DIR"; exit 1; }

# --- 備份 uploads 資料夾 ---
echo "📦 備份 uploads 目錄..."
if [ -d "../uploads" ]; then
  cd ..
  zip -r "backup/$DATE/uploads_$DATE.zip" uploads || { echo "❌ 備份 uploads 失敗"; exit 1; }
  cd scripts
  echo "✅ uploads 備份完成。"
else
  echo "⚠️ uploads 資料夾不存在，跳過。"
fi

# --- 備份 MongoDB ---
echo "🧠 備份 MongoDB..."
docker exec my-mongo mkdir -p /data/backup
docker exec my-mongo mongodump \
  --archive=/data/backup/mongo.bak \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="$AUTH_DB"

if [ $? -ne 0 ]; then
  echo "❌ mongodump 失敗"
  exit 1
fi

docker cp my-mongo:/data/backup/mongo.bak "$BACKUP_DIR/mongo_$DATE.bak" || { echo "❌ 無法複製 mongo 備份"; exit 1; }
echo "✅ MongoDB 備份完成。"

# --- 確認備份檔存在 ---
[ -f "$BACKUP_DIR/mongo_$DATE.bak" ] || { echo "❌ Mongo 備份遺失"; exit 1; }

# --- 完成訊息 ---
echo "🎉 所有備份完成，存放於: $BACKUP_DIR/"
echo "📁 uploads 備份大小: $(du -h "$BACKUP_DIR/uploads_$DATE.zip" 2>/dev/null | cut -f1 || echo '不存在')"
echo "🧠 Mongo 備份大小: $(du -h "$BACKUP_DIR/mongo_$DATE.bak" 2>/dev/null | cut -f1 || echo '不存在')"