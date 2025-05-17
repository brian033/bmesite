"use client";

import { useState, useEffect, useRef, memo } from "react";
// 使用 mammoth.js 代替 docx-preview
import mammoth from "mammoth";

interface DocxPreviewProps {
    fileUrl: string;
    height?: string;
    className?: string;
}

function DocxPreview({ fileUrl, height = "600px", className = "" }: DocxPreviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const [shouldLoad, setShouldLoad] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 使用 Intersection Observer 監測元素可見性
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // 當元素可見時
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    // 一旦決定加載，就不再需要觀察
                    observer.disconnect();
                }
            },
            {
                root: null,
                rootMargin: "200px", // 提前200px開始加載
                threshold: 0.1, // 當10%可見時觸發
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    // 只有當決定應該加載時才獲取文件
    useEffect(() => {
        if (!shouldLoad) return;

        const loadDocument = async () => {
            if (!fileUrl) {
                setError("未提供文件網址");
                setIsLoading(false);
                return;
            }

            try {
                // 添加防止緩存參數
                const cacheBuster = `?t=${new Date().getTime()}`;
                const response = await fetch(`${fileUrl}${cacheBuster}`);

                if (!response.ok) {
                    throw new Error(`加載文件失敗: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();

                // 使用動態導入加載 mammoth 以減少初始包大小
                const mammothModule = await import("mammoth");
                const result = await mammothModule.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value);
            } catch (err) {
                console.error("預覽文檔時出錯:", err);
                setError("無法預覽此文件");
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [fileUrl, shouldLoad]);

    return (
        <div className={`w-full m-3 ${className}`} ref={containerRef}>
            {!shouldLoad ? (
                <div
                    className="border border-gray-200 bg-gray-50 flex justify-center items-center"
                    style={{ height, cursor: "pointer" }}
                    onClick={() => setShouldLoad(true)}
                >
                    <div className="text-center">
                        <div className="mb-2">
                            <svg
                                className="w-8 h-8 mx-auto text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500">點擊或滾動至此預覽Word文檔</p>
                    </div>
                </div>
            ) : (
                <>
                    {isLoading && (
                        <div
                            className="flex justify-center items-center py-4 border border-gray-200 bg-gray-50"
                            style={{ height }}
                        >
                            <div className="text-center">
                                <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                                <div>文件轉換中...</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    大型文檔可能需要較長時間
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div
                            className="flex justify-center items-center py-4 border border-red-200 bg-red-50"
                            style={{ height }}
                        >
                            <div className="text-red-500">
                                <svg
                                    className="w-8 h-8 mx-auto mb-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div
                            className="border border-gray-200 bg-white p-4 shadow-sm"
                            style={{ height, overflow: "auto" }}
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        ></div>
                    )}
                </>
            )}
        </div>
    );
}

// 使用 memo 進一步優化性能，避免不必要的重新渲染
export default memo(DocxPreview);
