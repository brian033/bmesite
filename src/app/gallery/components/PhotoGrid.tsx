"use client";

import React from "react";
import Image from "next/image";
import { PhotoItem } from "../types";

interface PhotoGridProps {
    photos: PhotoItem[];
    baseUrl: string;
    prefix: string;
    onPhotoClick: (photo: PhotoItem) => void;
}

export default function PhotoGrid({ photos, baseUrl, prefix, onPhotoClick }: PhotoGridProps) {
    const [hoveredPhoto, setHoveredPhoto] = React.useState<string | null>(null);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => {
                const thumbUrl = `${baseUrl}/${prefix}/${photo.thumb_rel}`;
                const previewUrl = `${baseUrl}/${prefix}/${photo.preview_rel}`;
                const isHovered = hoveredPhoto === photo.name;

                return (
                    <div
                        key={photo.name}
                        className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                        onClick={() => onPhotoClick(photo)}
                        onMouseEnter={() => setHoveredPhoto(photo.name)}
                        onMouseLeave={() => setHoveredPhoto(null)}
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={thumbUrl}
                                alt={photo.name}
                                fill
                                className="object-cover transition-opacity duration-300"
                                loading="lazy"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            />

                            {/* Preview overlay on hover */}
                            {isHovered && (
                                <div className="absolute inset-0 z-10">
                                    <Image
                                        src={previewUrl}
                                        alt={photo.name}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                    />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-20" />

                            {/* Click indicator */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                <div className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
                                    點擊查看
                                </div>
                            </div>
                        </div>

                        {/* Photo info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="truncate">{photo.name}</p>
                            <p className="text-white/80">
                                {photo.width} × {photo.height}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
