"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoGrid from "../components/PhotoGrid";
import PhotoModal from "../components/PhotoModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { FolderManifest, PhotoItem } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE || "https://cdn.beame2025.cc";
const PREFIX = "gallery";

export default function FolderPage() {
    const params = useParams();
    const router = useRouter();
    const [manifest, setManifest] = useState<FolderManifest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reconstruct folder path from params
    const folderPath = Array.isArray(params.folder) ? params.folder.join("/") : params.folder || "";

    const decodedFolderPath = decodeURI(folderPath);

    useEffect(() => {
        const fetchManifest = async () => {
            if (!folderPath) return;

            try {
                const manifestUrl = `${BASE_URL}/${PREFIX}/${decodedFolderPath}/__manifests__/manifest.json`;
                const response = await fetch(manifestUrl);

                if (!response.ok) {
                    throw new Error(`載入失敗: ${response.status}`);
                }

                const data: FolderManifest = await response.json();
                setManifest(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "載入相片失敗");
            } finally {
                setLoading(false);
            }
        };

        fetchManifest();
    }, [folderPath, decodedFolderPath]);

    const handlePhotoClick = (photo: PhotoItem) => {
        setSelectedPhoto(photo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPhoto(null);
    };

    const handleNavigatePhoto = (direction: "prev" | "next") => {
        if (!manifest || !selectedPhoto) return;

        const currentIndex = manifest.items.findIndex((item) => item.name === selectedPhoto.name);
        let newIndex: number;

        if (direction === "prev") {
            newIndex = currentIndex > 0 ? currentIndex - 1 : manifest.items.length - 1;
        } else {
            newIndex = currentIndex < manifest.items.length - 1 ? currentIndex + 1 : 0;
        }

        setSelectedPhoto(manifest.items[newIndex]);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isModalOpen) return;

            switch (event.key) {
                case "Escape":
                    handleCloseModal();
                    break;
                case "ArrowLeft":
                    handleNavigatePhoto("prev");
                    break;
                case "ArrowRight":
                    handleNavigatePhoto("next");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, selectedPhoto, manifest]);

    // Generate breadcrumb
    const pathSegments = decodedFolderPath.split("/").filter(Boolean);
    const displayName = pathSegments[pathSegments.length - 1] || decodedFolderPath;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">{displayName}</h1>
                    <LoadingSpinner />
                    <p className="text-muted-foreground mt-4">載入中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">{displayName}</h1>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-destructive font-medium">載入失敗</p>
                        <p className="text-muted-foreground mt-2">{error}</p>
                        <div className="flex gap-2 mt-4 justify-center">
                            <Button variant="outline" onClick={() => router.back()}>
                                返回
                            </Button>
                            <Button onClick={() => window.location.reload()}>重新載入</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!manifest) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">{displayName}</h1>
                    <p className="text-muted-foreground">暫無相片資料</p>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        返回
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <Link href="/gallery" className="hover:text-foreground transition-colors">
                    <Home className="h-4 w-4" />
                </Link>
                <ChevronRight className="h-4 w-4" />
                {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;
                    const path = pathSegments.slice(0, index + 1).join("/");

                    return (
                        <React.Fragment key={segment}>
                            {isLast ? (
                                <span className="text-foreground font-medium">{segment}</span>
                            ) : (
                                <>
                                    <Link
                                        href={`/gallery/${encodeURI(path)}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {segment}
                                    </Link>
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">{displayName}</h1>
                <p className="text-muted-foreground">共 {manifest.count} 張相片</p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-8">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    返回
                </Button>

                <Link href="/gallery">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        相片庫首頁
                    </Button>
                </Link>
            </div>

            {/* Photo Grid */}
            <PhotoGrid
                photos={manifest.items}
                baseUrl={BASE_URL}
                prefix={PREFIX}
                onPhotoClick={handlePhotoClick}
            />

            {/* Photo Modal */}
            <PhotoModal
                photo={selectedPhoto}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                baseUrl={BASE_URL}
                prefix={PREFIX}
            />
        </div>
    );
}
