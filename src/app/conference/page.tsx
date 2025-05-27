import { Metadata } from "next";

export const metadata: Metadata = {
    title: "會議資訊 | 2025 生物機電工程學術研討會",
    description: "了解 2025 生物機電工程學術研討會的相關資訊",
};

export default function ConferencePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">會議資訊</h1>

            {/* 移除任何可能含有無效 URL 的內容 */}
            <div className="prose max-w-none">
                <p>
                    歡迎參加 2025
                    生物機電工程學術研討會。本頁面提供會議的詳細資訊，包括日期、地點、議程等。
                </p>

                {/* 內容區塊 */}
            </div>
        </div>
    );
}
