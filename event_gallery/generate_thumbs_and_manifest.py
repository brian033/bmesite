#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import io
import json
import argparse
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List
from tqdm import tqdm
from PIL import Image, ImageOps

# 可選：HEIC/HEIF 支援
try:
    import pillow_heif  # pip install pillow-heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

VALID_EXTS = {".jpg", ".jpeg", ".png",
              ".webp", ".heic", ".heif", ".tif", ".tiff"}


@dataclass
class PhotoItem:
    name: str
    original_rel: str     # 原圖相對於「來源根目錄」的相對路徑（保留中文/原始檔名）
    thumb_rel: str        # 產生的拇指圖相對於「輸出根目錄」的路徑
    preview_rel: str      # 產生的預覽圖相對於「輸出根目錄」的路徑
    width: int
    height: int
    bytes: int


def is_image(p: Path) -> bool:
    return p.suffix.lower() in VALID_EXTS


def open_image(p: Path) -> Image.Image:
    img = Image.open(p)
    img.load()
    # 校正 EXIF 旋轉、轉 RGB 並去除 EXIF
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    else:
        img = img.convert("RGB")
    return img


def downscale(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_side:
        return img.copy()
    scale = max_side / float(max(w, h))
    new_size = (int(w * scale), int(h * scale))
    return img.resize(new_size, Image.LANCZOS)


def save_webp(img: Image.Image, out_path: Path, quality: int):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="WEBP", quality=quality, method=6)


def rel_to(base: Path, p: Path) -> str:
    return p.relative_to(base).as_posix()


def build_for_folder(src_root: Path, out_root: Path, folder: Path,
                     thumb_max: int, preview_max: int, quality_thumb: int,
                     quality_preview: int, force: bool) -> str | None:
    """
    對「來源根目錄下的某個資料夾」產生縮圖與 manifest，回傳 manifest 的相對路徑
    """
    images = [p for p in sorted(folder.iterdir())
              if p.is_file() and is_image(p)]
    if not images:
        return None

    items: List[PhotoItem] = []
    # 設計輸出層級：維持與來源相同層級，在相對應資料夾下放 __thumbs__/ 與 __preview__/ 與 __manifests__/manifest.json
    rel_folder = rel_to(src_root, folder)
    thumbs_dir = out_root / rel_folder / "__thumbs__"
    preview_dir = out_root / rel_folder / "__preview__"
    manifest_dir = out_root / rel_folder / "__manifests__"
    manifest_path = manifest_dir / "manifest.json"

    for img_path in tqdm(images, desc=f"[images] {rel_folder}", leave=False):
        try:
            stem = img_path.stem
            thumb_path = thumbs_dir / f"{stem}.webp"
            preview_path = preview_dir / f"{stem}.webp"

            # 若非 force，且縮圖都存在，就略過重算
            need_thumb = force or (not thumb_path.exists())
            need_prev = force or (not preview_path.exists())

            # 讀一次原圖，避免重複 I/O
            if need_thumb or need_prev:
                img = open_image(img_path)
                w, h = img.size

                if need_thumb:
                    timg = downscale(img, thumb_max)
                    save_webp(timg, thumb_path, quality_thumb)
                if need_prev:
                    pimg = downscale(img, preview_max)
                    save_webp(pimg, preview_path, quality_preview)
            else:
                # 為了寫尺寸到 manifest，仍需讀一次（或你可記錄 sidecar cache）
                img = open_image(img_path)
                w, h = img.size

            items.append(PhotoItem(
                name=img_path.name,
                original_rel=rel_to(src_root, img_path),
                thumb_rel=rel_to(out_root, thumb_path),
                preview_rel=rel_to(out_root, preview_path),
                width=w, height=h,
                bytes=img_path.stat().st_size
            ))
        except Exception as e:
            print(f"[SKIP] {img_path}: {e}")

    manifest = {
        "folder": rel_folder,
        "count": len(items),
        "items": [asdict(x) for x in items],
        "version": 1
    }
    manifest_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(
        manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return rel_to(out_root, manifest_path)


def build_index(out_root: Path, manifests: List[str], src_root: Path):
    """
    根層 index.json：列出所有資料夾、張數與封面（第一張 thumb）
    """
    folders = []
    for mrel in manifests:
        mpath = out_root / mrel
        try:
            data = json.loads(mpath.read_text(encoding="utf-8"))
            cover = data["items"][0]["thumb_rel"] if data["items"] else None
            folders.append({
                "folder": data["folder"],
                "manifest_rel": mrel,
                "count": data["count"],
                "cover_thumb_rel": cover
            })
        except Exception as e:
            print(f"[INDEX WARN] {mpath}: {e}")

    index = {
        "source_root": src_root.name,
        "folders": sorted(folders, key=lambda x: x["folder"]),
        "version": 1
    }
    (out_root / "index.json").write_text(json.dumps(index,
                                                    ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(
        description="Recursively generate thumbnails & per-folder manifest (no upload).")
    ap.add_argument("src", type=Path, help="來源相片根目錄（原始圖片）")
    ap.add_argument("out", type=Path, help="輸出根目錄（放縮圖與 manifest）")
    ap.add_argument("--thumb-max", type=int,
                    default=512, help="拇指圖長邊像素（預設 512）")
    ap.add_argument("--preview-max", type=int,
                    default=1280, help="預覽圖長邊像素（預設 1280）")
    ap.add_argument("--q-thumb", type=int, default=80,
                    help="拇指圖 WEBP 品質（預設 80）")
    ap.add_argument("--q-preview", type=int, default=82,
                    help="預覽圖 WEBP 品質（預設 82）")
    ap.add_argument("--force", action="store_true", help="忽略快取，強制重建所有縮圖")
    args = ap.parse_args()

    src_root: Path = args.src.resolve()
    out_root: Path = args.out.resolve()
    if not src_root.exists():
        raise SystemExit(f"來源資料夾不存在：{src_root}")

    manifests: List[str] = []

    # 收集所有「包含圖片」的資料夾（只看該層，不含子資料夾）
    folders = []
    for dirpath, dirnames, filenames in os.walk(src_root):
        folder = Path(dirpath)
        if any(is_image(Path(fn)) for fn in filenames):
            folders.append(folder)

    # 逐資料夾處理
    for folder in tqdm(folders, desc="Folders"):
        mrel = build_for_folder(
            src_root, out_root, folder,
            args.thumb_max, args.preview_max,
            args.q_thumb, args.q_preview,
            args.force
        )
        if mrel:
            manifests.append(mrel)

    # 產生根層 index.json
    build_index(out_root, manifests, src_root)
    print(
        f"\n完成！輸出在：{out_root}\n- 根索引：{(out_root/'index.json').as_posix()}\n- 每資料夾：.../__manifests__/manifest.json")


if __name__ == "__main__":
    main()
