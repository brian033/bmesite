#!/bin/bash

# 定義日期格式，用於創建備份目錄
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# 創建備份目錄
BACKUP_DIR="./backup/$DATE"
mkdir -p "$BACKUP_DIR" || { echo "無法創建備份目錄: $BACKUP_DIR"; exit 1; }

# 備份 uploads 目錄
echo "開始備份 uploads 目錄..."
if [ -d "./uploads" ]; then
  zip -r "$BACKUP_DIR/uploads_$DATE.zip" ./uploads || { echo "備份 uploads 目錄失敗"; exit 1; }
  echo "uploads 目錄備份完成。"
else
  echo "警告: uploads 目錄不存在，跳過備份。"
fi

# 備份 db 目錄
echo "開始備份 db 目錄..."
if [ -d "./db" ]; then
  zip -r "$BACKUP_DIR/db_$DATE.zip" ./db || { echo "備份 db 目錄失敗"; exit 1; }
  echo "db 目錄備份完成。"
else
  echo "警告: db 目錄不存在，跳過備份。"
fi

# 檢查備份文件是否創建成功
echo "檢查備份文件完整性..."
if [ -d "./uploads" ] && [ ! -f "$BACKUP_DIR/uploads_$DATE.zip" ]; then
  echo "錯誤: uploads 備份文件創建失敗。"
  exit 1
fi

if [ -d "./db" ] && [ ! -f "$BACKUP_DIR/db_$DATE.zip" ]; then
  echo "錯誤: db 備份文件創建失敗。"
  exit 1
fi

echo "備份完成。備份文件位於: $BACKUP_DIR/"
echo "uploads 備份大小: $(du -h "$BACKUP_DIR/uploads_$DATE.zip" 2>/dev/null | cut -f1 || echo '不存在')"
echo "db 備份大小: $(du -h "$BACKUP_DIR/db_$DATE.zip" 2>/dev/null | cut -f1 || echo '不存在')"