"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { PhotoItem } from "../types";

interface PhotoModalProps {
    photo: PhotoItem | null;
    isOpen: boolean;
    onClose: () => void;
    baseUrl: string;
    prefix: string;
}

export default function PhotoModal({ photo, isOpen, onClose, baseUrl, prefix }: PhotoModalProps) {
    const [isZoomed, setIsZoomed] = React.useState(false);

    if (!photo) return null;

    const originalUrl = `${baseUrl}/${prefix}/${photo.original_rel}`;
    const previewUrl = `${baseUrl}/${prefix}/${photo.preview_rel}`;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = originalUrl;
        link.download = photo.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes: number): string => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden [&>button]:top-2 [&>button]:right-2">
                <DialogTitle className="sr-only">{photo.name}</DialogTitle>
                <div className="relative flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg truncate">{photo.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {photo.width} × {photo.height} • {formatFileSize(photo.bytes)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsZoomed(!isZoomed)}
                                className="hidden sm:flex"
                            >
                                {isZoomed ? (
                                    <ZoomOut className="h-4 w-4" />
                                ) : (
                                    <ZoomIn className="h-4 w-4" />
                                )}
                                {isZoomed ? "縮小" : "放大"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">下載原圖</span>
                            </Button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 relative overflow-auto bg-black/5">
                        <div className={`relative ${isZoomed ? "w-full h-auto" : "w-full h-full"}`}>
                            <Image
                                src={isZoomed ? originalUrl : previewUrl}
                                alt={photo.name}
                                width={photo.width}
                                height={photo.height}
                                className={`${
                                    isZoomed ? "w-full h-auto" : "w-full h-full object-contain"
                                }`}
                                priority
                                quality={isZoomed ? 100 : 85}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
