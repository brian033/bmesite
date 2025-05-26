import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import importantDates, { ImportantDate } from "@/data/importantDates";

export default function ImportantDates() {
    // 在伺服器端取得當前日期
    const currentDate = new Date();

    // 檢查日期是否已過期
    const isDatePassed = (dateStr: string): boolean => {
        const targetDate = new Date(dateStr);
        // 去除時間部分，只比較日期
        const targetDateOnly = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
        );

        const currentDateOnly = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
        );

        return targetDateOnly < currentDateOnly;
    };

    return (
        <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6 text-green-700 border-b pb-2">《 重要時程 》</h2>
            <div className="space-y-5">
                {importantDates.map((item, index) => (
                    <div key={index}>
                        <p className="font-semibold text-3xl">
                            {item.title}：
                            {item.isExtended && item.originalDate ? (
                                <span className="line-through text-gray-500 ml-1">
                                    {item.originalDisplayText}
                                </span>
                            ) : (
                                <span
                                    className={`ml-1 ${
                                        isDatePassed(item.date)
                                            ? "text-gray-400"
                                            : "text-red-600 font-bold"
                                    }`}
                                >
                                    {item.displayText}
                                </span>
                            )}
                        </p>
                        {item.isExtended && (
                            <p className="text-red-600 font-bold text-3xl">
                                延長至{item.displayText}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
