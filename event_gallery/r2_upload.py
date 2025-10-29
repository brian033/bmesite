#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import argparse
import mimetypes
import sys
from pathlib import Path
from typing import Dict, Any
from tqdm import tqdm
from dotenv import load_dotenv

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

load_dotenv()

# --- R2 config ---
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET")
R2_PUBLIC_BASE = (os.getenv("R2_PUBLIC_BASE") or "").rstrip("/")
R2_PREFIX = (os.getenv("R2_PREFIX") or "").strip("/")

if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET]):
    print("❌ 請先在 .env 填妥 R2_* 變數（ACCOUNT_ID / ACCESS_KEY_ID / SECRET / BUCKET）")
    sys.exit(1)

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version="s3v4"),
)


def ct_guess(path: Path) -> str:
    ct, _ = mimetypes.guess_type(path.name)
    return ct or "application/octet-stream"


def r2_key(local_rel: str) -> str:
    """把相對路徑轉成 R2 物件 key，前面接 R2_PREFIX（若有）"""
    return f"{R2_PREFIX}/{local_rel}".strip("/") if R2_PREFIX else local_rel


def head_ok(bucket: str, key: str) -> Dict[str, Any] | None:
    try:
        return s3.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 404:
            return None
        return None


def upload_file(local: Path, key: str, overwrite: bool, dry_run: bool) -> bool:
    """回傳 True 表示有上傳或確認跳過成功；False 表示失敗"""
    if not local.is_file():
        print(f"[SKIP] 找不到檔案：{local}")
        return False
    if not overwrite:
        meta = head_ok(R2_BUCKET, key)
        if meta is not None and meta.get("ContentLength") == local.stat().st_size:
            # 同大小 → 多半相同，直接跳過（省費用）
            print(f"[=] SKIP（已存在且同大小）: {key}")
            return True
    if dry_run:
        print(f"[DRY] 將上傳: {key} ← {local}")
        return True
    with open(local, "rb") as f:
        s3.put_object(
            Bucket=R2_BUCKET,
            Key=key,
            Body=f,
            ContentType=ct_guess(local),
            ACL="public-read",
        )
    print(f"[UP] {key}")
    return True


def main():
    ap = argparse.ArgumentParser(
        description="Upload ONE folder to Cloudflare R2 (thumb/preview/manifest and optional originals).")
    ap.add_argument("--out-root", required=True, type=Path,
                    help="縮圖與 manifest 的輸出根目錄（ex: ./gallery_out）")
    ap.add_argument("--src-root", required=True, type=Path,
                    help="原始照片的根目錄（ex: ./生物機電研討會照片）")
    ap.add_argument("--folder",   required=True,
                    help="要上傳的單一資料夾（相對於 src-root/out-root 的相同相對路徑，如：Day1/01-報到處）")
    ap.add_argument("--include-originals", action="store_true",
                    help="同時上傳原圖（依 manifest 的 original_rel）")
    ap.add_argument("--upload-index", action="store_true",
                    help="一併上傳 out-root/index.json（首頁清單）")
    ap.add_argument("--overwrite", action="store_true", help="強制覆寫遠端檔案（不比對大小）")
    ap.add_argument("--dry-run", action="store_true", help="只顯示將會上傳的檔案，不實際上傳")
    args = ap.parse_args()

    out_root = args.out_root.resolve()
    src_root = args.src_root.resolve()
    folder_rel = args.folder.strip("/")

    # 找該資料夾的 manifest.json
    manifest_path = out_root / folder_rel / "__manifests__" / "manifest.json"
    if not manifest_path.is_file():
        print(f"❌ 找不到 manifest：{manifest_path}")
        sys.exit(2)

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = data.get("items", [])
    print(f"資料夾：{folder_rel}  |  總張數：{len(items)}")

    # 逐張上傳：thumb / preview（必傳）
    ok_cnt = 0
    fail_cnt = 0

    # 先上傳 manifest.json（讓頁面先能載入再逐步看到圖片也可以，但這裡先放最後上傳）
    # 上傳縮圖與預覽
    for it in tqdm(items, desc="thumb/preview"):
        thumb_local = out_root / it["thumb_rel"]
        preview_local = out_root / it["preview_rel"]

        thumb_key = r2_key(it["thumb_rel"])
        preview_key = r2_key(it["preview_rel"])

        if upload_file(thumb_local, thumb_key, args.overwrite, args.dry_run):
            ok_cnt += 1
        else:
            fail_cnt += 1
        if upload_file(preview_local, preview_key, args.overwrite, args.dry_run):
            ok_cnt += 1
        else:
            fail_cnt += 1

    # 原圖（可選）
    if args.include_originals:
        for it in tqdm(items, desc="originals"):
            orig_local = src_root / it["original_rel"]
            orig_key = r2_key(it["original_rel"])
            if upload_file(orig_local, orig_key, args.overwrite, args.dry_run):
                ok_cnt += 1
            else:
                fail_cnt += 1

    # 上傳該資料夾的 manifest.json
    manifest_key_rel = f"{folder_rel}/__manifests__/manifest.json"
    if upload_file(manifest_path, r2_key(manifest_key_rel), True, args.dry_run):
        ok_cnt += 1
    else:
        fail_cnt += 1

    # （可選）上傳根層 index.json
    if args.upload_index:
        index_local = out_root / "index.json"
        if index_local.is_file():
            upload_file(index_local, r2_key("index.json"), True, args.dry_run)

    print(f"\n完成：OK={ok_cnt}, FAIL={fail_cnt}")
    if R2_PUBLIC_BASE:
        base = f"{R2_PUBLIC_BASE}/{R2_PREFIX}".rstrip("/")
        print(
            f"可用基底網址（範例）:\n- 資料夾 manifest: {base}/{folder_rel}/__manifests__/manifest.json")
        # 取第一張當示例
        if items:
            print(f"- 第一張縮圖：{base}/{items[0]['thumb_rel']}")
            print(f"- 第一張預覽：{base}/{items[0]['preview_rel']}")
        if args.include_originals and items:
            print(f"- 第一張原圖：{base}/{items[0]['original_rel']}")
    else:
        print("⚠️ 你沒有在 .env 設定 R2_PUBLIC_BASE，以上不顯示公網 URL。")


if __name__ == "__main__":
    main()
