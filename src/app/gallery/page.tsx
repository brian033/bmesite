"use client";

import React from "react";
import { useState, useEffect } from "react";
import GalleryFolderCard from "./components/GalleryFolderCard";
import LoadingSpinner from "./components/LoadingSpinner";
import { GalleryIndex } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE || "https://cdn.beame2025.cc";
const PREFIX = "gallery";

export default function GalleryPage() {
    const [galleryIndex, setGalleryIndex] = useState<GalleryIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGalleryIndex = async () => {
            try {
                const indexUrl = `${BASE_URL}/${PREFIX}/index.json`;
                const response = await fetch(indexUrl);

                if (!response.ok) {
                    throw new Error(`載入失敗: ${response.status}`);
                }

                const data: GalleryIndex = await response.json();
                setGalleryIndex(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "載入相片庫失敗");
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryIndex();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">BEAME 2025 相片庫</h1>
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
                    <h1 className="text-3xl font-bold mb-8">BEAME 2025 相片庫</h1>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-destructive font-medium">載入失敗</p>
                        <p className="text-muted-foreground mt-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            重新載入
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!galleryIndex) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-8">BEAME 2025 相片庫</h1>
                    <p className="text-muted-foreground">暫無相片資料</p>
                </div>
            </div>
        );
    }

    // Group folders by day/category for better organization
    const groupedFolders = galleryIndex.folders.reduce((acc, folder) => {
        const category = folder.folder.split("/")[0] || "其他";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(folder);
        return acc;
    }, {} as Record<string, typeof galleryIndex.folders>);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">BEAME 2025 相片庫</h1>
                <p className="text-muted-foreground">
                    共 {galleryIndex.folders.length} 個相片集，
                    {galleryIndex.folders.reduce((sum, folder) => sum + folder.count, 0)} 張相片
                </p>
            </div>

            <div className="space-y-12">
                {Object.entries(groupedFolders).map(([category, folders]) => (
                    <div key={category}>
                        <h2 className="text-2xl font-semibold mb-6 text-center">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {folders.map((folder) => (
                                <GalleryFolderCard
                                    key={folder.folder}
                                    folder={folder}
                                    baseUrl={BASE_URL}
                                    prefix={PREFIX}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
