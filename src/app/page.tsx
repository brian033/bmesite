import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Download, Users } from "lucide-react";
// import ImportantDates from "./components/ImportantDates";
import AnnouncementCard from "./components/AnnouncementCard";
import ImportantDatesCard from "./components/ImportantDatesCard";

export function PaymentInfo() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
            <h3 className="text-xl font-semibold mb-4 text-center">報名費用</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-green-50">
                            <th className="p-2 border border-green-200">報名期間</th>
                            <th className="p-2 border border-green-200">會員</th>
                            <th className="p-2 border border-green-200">非會員</th>
                            <th className="p-2 border border-green-200">學生</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border border-green-200">早鳥價</td>
                            <td className="p-2 border border-green-200">800</td>
                            <td className="p-2 border border-green-200">900</td>
                            <td className="p-2 border border-green-200">600</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-green-200">一般價</td>
                            <td className="p-2 border border-green-200">900</td>
                            <td className="p-2 border border-green-200">1000</td>
                            <td className="p-2 border border-green-200">700</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-green-200">現場報名</td>
                            <td className="p-2 border border-green-200">1000</td>
                            <td className="p-2 border border-green-200">1100</td>
                            <td className="p-2 border border-green-200">800</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">註：所有費用單位為新台幣</p>
            <p className="text-sm text-gray-500 mt-4">繳費專用聯絡信箱：TIBM2003@outlook.com</p>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 頂部橫幅 - 移除可能的上邊距 */}
            <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh]">
                <Image
                    src="/webpage/banner.JPG"
                    fill
                    alt="2025 農機與生機學術研討會"
                    className="object-cover"
                    priority
                />
            </div>

            {/* 主要內容 */}
            <div className="container mx-auto px-4 py-12">
                {/* 重要時程區塊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="relative">
                        <Image
                            src="/webpage/poster.JPG"
                            width={600}
                            height={600}
                            alt="BIME 2025"
                            className="object-contain"
                        />
                    </div>

                    {/* 使用獨立的重要時程組件 */}
                    <div className="h-600px">
                        <ImportantDatesCard />
                        <PaymentInfo />
                    </div>
                </div>

                {/* 會議資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center border border-green-100">
                        <CalendarDays className="h-12 w-12 text-green-700 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">會議日期</h3>
                        <p>2025年9月25日(四) - 9月26日(五)</p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center border border-green-100">
                        <MapPin className="h-12 w-12 text-green-700 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">會議地點</h3>
                        <p>國立臺灣大學生物機電工程學系</p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center border border-green-100">
                        <Users className="h-12 w-12 text-green-700 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">主辦單位</h3>
                        <p>臺灣生物機電學會</p>
                    </div>
                </div>
                <AnnouncementCard />
                {/* 研討會簡介 */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">研討會簡介</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-700 mb-4">
                            匯集國內外專家學者共同探討最新研究成果與技術發展。
                        </p>
                    </div>
                </div>

                {/* 研討主題 */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">研討主題</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            "生物產業機械",
                            "生物生產工程",
                            "畜牧自動化與污染防治",
                            "農業設施與環控工程",
                            "生物機電控制",
                            "生醫工程與微奈米機電",
                            "生物資訊與系統",
                            "能源與節能技術",
                            "AI與大數據分析",
                            "精準農業智動化",
                            "其他新興科技",
                        ].map((topic, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-4 rounded border border-gray-200 text-center hover:bg-green-50 hover:border-green-200 transition-colors"
                            >
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
