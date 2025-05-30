#!/bin/bash

# --- 檢查參數 ---
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "❌ 錯誤：請提供 MongoDB 密碼 和 備份資料夾路徑"
  echo "📖 用法: bash $0 <mongo_password> <backup_folder_path>"
  exit 1
fi

MONGO_PASS="$1"
BACKUP_PATH="$2"
MONGO_USER="admin"
AUTH_DB="admin"

# --- script 位置 ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPLOADS_PATH="$SCRIPT_DIR/../uploads"

# --- 找到備份檔案 ---
BAK_FILE=$(find "$BACKUP_PATH" -name "*.bak" | head -n 1)
ZIP_FILE=$(find "$BACKUP_PATH" -name "uploads_*.zip" | head -n 1)

# --- 檢查檔案存在 ---
[ ! -f "$BAK_FILE" ] && { echo "❌ 找不到 MongoDB 備份檔 (.bak) 於: $BACKUP_PATH"; exit 1; }
[ ! -f "$ZIP_FILE" ] && { echo "❌ 找不到 uploads 壓縮檔 (.zip) 於: $BACKUP_PATH"; exit 1; }

echo "🔒 Mongo 密碼已提供，將還原以下檔案："
echo "  🧠 Mongo 備份：$BAK_FILE"
echo "  📦 uploads 壓縮：$ZIP_FILE"

# --- 備份當前狀態 ---
echo "🛟 備份當前狀態..."
bash "$SCRIPT_DIR/backup.sh" "$MONGO_PASS" || { echo "❌ 備份失敗，取消還原"; exit 1; }

# --- 刪除現有 uploads ---
echo "🧹 清除現有 uploads 資料夾..."
rm -rf "$UPLOADS_PATH" || { echo "❌ 刪除 uploads 失敗"; exit 1; }

# --- 解壓 uploads zip 檔 ---
echo "📥 解壓備份 uploads 到 uploads/"
unzip "$ZIP_FILE" -d "$SCRIPT_DIR/../" || { echo "❌ 解壓 uploads 失敗"; exit 1; }

# --- 傳送 MongoDB 備份檔到容器 ---
echo "📤 傳送 .bak 備份檔到容器..."
docker cp "$BAK_FILE" my-mongo:/data/restore.bak || { echo "❌ 複製 .bak 檔失敗"; exit 1; }

# --- 執行還原 ---
echo "♻️ 還原 MongoDB 中..."
docker exec my-mongo mongorestore \
  --drop \
  --archive=/data/restore.bak \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="$AUTH_DB"

[ $? -ne 0 ] && { echo "❌ MongoDB 還原失敗"; exit 1; }

echo "✅ 完成還原！uploads 和 MongoDB 已同步回復"