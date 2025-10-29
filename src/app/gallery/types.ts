// Types for the BEAME 2025 Photo Gallery

export interface GalleryIndex {
    source_root: string;
    folders: GalleryFolder[];
    version: number;
}

export interface GalleryFolder {
    folder: string;
    manifest_rel: string;
    count: number;
    cover_thumb_rel: string;
}

export interface FolderManifest {
    folder: string;
    count: number;
    items: PhotoItem[];
    version: number;
}

export interface PhotoItem {
    name: string;
    original_rel: string;
    thumb_rel: string;
    preview_rel: string;
    width: number;
    height: number;
    bytes: number;
}
