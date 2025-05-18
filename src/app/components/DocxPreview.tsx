"use client";

import { useState, useEffect } from "react";
import mammoth from "mammoth";

interface DocxPreviewProps {
    fileUrl: string;
    isOpen: boolean;
    height?: string;
    className?: string;
}

function DocxPreview({ fileUrl, isOpen, height = "600px", className = "" }: DocxPreviewProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [htmlContent, setHtmlContent] = useState("");

    // 當 isOpen 第一次變為 true 時，開始加載文件
    useEffect(() => {
        if (isOpen && !shouldRender) {
            setShouldRender(true);
        }
    }, [isOpen]);

    // 只在需要渲染時加載文件
    useEffect(() => {
        if (!shouldRender) return;

        const loadDocument = async () => {
            try {
                const cacheBuster = `?t=${new Date().getTime()}`;
                const response = await fetch(`${fileUrl}${cacheBuster}`);

                if (!response.ok) {
                    throw new Error(`加載文件失敗: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value);
            } catch (err) {
                console.error("預覽文檔時出錯:", err);
                setError("無法預覽此文件");
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [fileUrl, shouldRender]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div className={`w-full my-2 ${className}`}>
            {isLoading && (
                <div
                    className="flex justify-center items-center py-4 border border-gray-200 bg-gray-50"
                    style={{ height }}
                >
                    <div className="text-center">
                        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                        <div>文件轉換中...</div>
                    </div>
                </div>
            )}

            {error && (
                <div
                    className="flex justify-center items-center py-4 border border-red-200 bg-red-50"
                    style={{ height }}
                >
                    <div className="text-red-500">{error}</div>
                </div>
            )}

            {!isLoading && !error && (
                <div
                    className="border border-gray-200 bg-white p-4 shadow-sm"
                    style={{ height, overflow: "auto" }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            )}
        </div>
    );
}

export default DocxPreview;
