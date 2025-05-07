"use client";

import { useState, useEffect } from "react";
// 使用 mammoth.js 代替 docx-preview
import mammoth from "mammoth";

interface DocxPreviewProps {
    fileUrl: string;
    height?: string;
    className?: string;
}

export default function DocxPreview({
    fileUrl,
    height = "600px",
    className = "",
}: DocxPreviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        const loadDocument = async () => {
            if (!fileUrl) {
                setError("未提供文件網址");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error(`加載文件失敗: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();

                // 使用 mammoth 將 docx 轉換為 HTML
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
    }, [fileUrl]);

    return (
        <div className={`w-full ${className}`}>
            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <div>文件載入中...</div>
                </div>
            )}

            {error && <div className="text-red-500 py-2">{error}</div>}

            {!isLoading && !error && (
                <div
                    className="border border-gray-200 bg-white p-4"
                    style={{ height, overflow: "auto" }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                ></div>
            )}
        </div>
    );
}
