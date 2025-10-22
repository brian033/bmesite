"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GalleryFolder } from "../types";

interface GalleryFolderCardProps {
    folder: GalleryFolder;
    baseUrl: string;
    prefix: string;
}

export default function GalleryFolderCard({ folder, baseUrl, prefix }: GalleryFolderCardProps) {
    const coverUrl = `${baseUrl}/${prefix}/${folder.cover_thumb_rel}`;
    const folderPath = encodeURI(folder.folder);

    // Extract display name from folder path
    const displayName = folder.folder.split("/").pop() || folder.folder;

    return (
        <Link href={`/gallery/${folderPath}`} className="group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                        src={coverUrl}
                        alt={`${displayName} 封面`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg overflow-hidden text-ellipsis">
                        {displayName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                            {folder.count} 張相片
                        </Badge>
                        <span className="text-sm text-muted-foreground">點擊查看</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
