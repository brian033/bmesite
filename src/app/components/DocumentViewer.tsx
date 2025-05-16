"use client";

import { useState, useEffect } from "react";

const DocumentViewer = ({ fileUrl }: { fileUrl: string }) => {
    const [isClient, setIsClient] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    // 確保只在客戶端執行
    useEffect(() => {
        setIsClient(true);

        // 創建 Intersection Observer 實例
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // 當元素進入視口時
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        setHasIntersected(true);
                        // 一旦加載了PDF，就不再需要觀察
                        observer.disconnect();
                    }
                });
            },
            {
                root: null, // 使用視口作為根
                rootMargin: "100px", // 提前100px開始加載
                threshold: 0.1, // 當10%可見時觸發
            }
        );

        // 找到當前元素並開始觀察
        const currentElement = document.getElementById("pdf-container");
        if (currentElement) {
            observer.observe(currentElement);
        }

        // 清理函數
        return () => {
            observer.disconnect();
        };
    }, []);

    // 顯示佔位符或 PDF 檢視器
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }} id="pdf-container">
            <div style={{ border: "1px solid #ddd", padding: "10px" }}>
                {!isClient ? (
                    // 服務端渲染時顯示靜態佔位符
                    <div
                        style={{
                            width: "100%",
                            height: "500px",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span>PDF 檢視器準備中...</span>
                    </div>
                ) : hasIntersected || isVisible ? (
                    // 元素可見時加載 PDF
                    <embed src={fileUrl} width="100%" height="500px" type="application/pdf" />
                ) : (
                    // 尚未進入視口時顯示佔位符
                    <div
                        style={{
                            width: "100%",
                            height: "500px",
                            backgroundColor: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    margin: "0 auto 10px",
                                    border: "4px solid #ddd",
                                    borderTop: "4px solid #3498db",
                                    borderRadius: "50%",
                                }}
                            />
                            <span>向下滾動來載入 PDF</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 使用 React.memo 避免不必要的重新渲染
export default DocumentViewer;
