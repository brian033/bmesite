import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    FileText,
    Mail,
    CreditCard,
    User,
    Upload,
    BookOpen,
    AlertCircle,
    Clock,
    Presentation,
} from "lucide-react";

const ConferenceTopics = [
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
];
import { PaymentInfo } from "../page";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 主要內容 */}
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8 text-center">研討會資訊</h1>

                {/* 繳款資訊與論文提交 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* 繳款資訊 */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <div className="flex items-center mb-4">
                            <CreditCard className="h-6 w-6 text-green-700 mr-2" />
                            <h2 className="text-xl font-semibold">繳款資訊</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start">
                                <span className="font-medium text-gray-700 min-w-[80px]">
                                    電子支付：
                                </span>
                                <span>登入系統後使用綠界支付付款</span>
                            </div>
                        </div>

                        {/* <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-6">
                            <p className="text-red-600 flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>繳費收據請於研討會當天至簽到處領取。</span>
                            </p>
                        </div> */}
                        <PaymentInfo />
                    </div>

                    {/* 論文提交與聯絡資訊 */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                            <div className="flex items-center mb-4">
                                <FileText className="h-6 w-6 text-green-700 mr-2" />
                                <h2 className="text-xl font-semibold">海報與口頭報告投稿</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-6">
                                <Link href="/profile" className="block">
                                    <Button className="w-full bg-green-700 hover:bg-green-800">
                                        <User className="mr-2 h-4 w-4" /> 個人頁面建立審稿案
                                    </Button>
                                </Link>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <ul className="text-amber-700 list-disc list-inside space-y-1">
                                    <li>報名系統需登入Google帳戶</li>
                                    <li>上傳摘要通過後再上傳全文</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                            <div className="flex items-center mb-4">
                                <Mail className="h-6 w-6 text-green-700 mr-2" />
                                <h2 className="text-xl font-semibold">聯絡窗口</h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium mb-1">盧彥文 教授</p>
                                    <p className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-600" />
                                        <a
                                            href="mailto:yenwenlu@ntu.edu.tw"
                                            className="text-blue-600 hover:underline"
                                        >
                                            yenwenlu@ntu.edu.tw
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">周呈霙 教授</p>
                                    <p className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-600" />
                                        <a
                                            href="mailto:chengying@ntu.edu.tw"
                                            className="text-blue-600 hover:underline"
                                        >
                                            chengying@ntu.edu.tw
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 研討會主題 */}
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <BookOpen className="h-6 w-6 text-green-700 mr-2" />
                        <h2 className="text-2xl font-semibold">本次研討會分場會議主題</h2>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ConferenceTopics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded border border-gray-200 text-center hover:bg-green-50 hover:border-green-200 transition-colors flex items-center"
                                >
                                    <span className="text-green-800 font-medium mr-2">
                                        {index + 1}.
                                    </span>
                                    <span>{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 論文發表形式 */}
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <Presentation className="h-6 w-6 text-green-700 mr-2" />
                        <h2 className="text-2xl font-semibold">研討會論文發表形式</h2>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <p className="mb-4">
                            本次研討會分為口頭報表(Oral)及海報發表(Poster)兩種形式，格式請參照2025生機與農機學術研討會網站之
                            <Link href="/downloads" className="text-blue-600 hover:underline">
                                下載專區
                            </Link>
                            所提供之「論文格式」相 關條件。
                        </p>

                        <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-6">
                            <h3 className="text-xl font-medium mb-3 text-green-800 text-center">
                                ※ 注意事項 ※
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>摘要接受通知後，開放論文全文上傳。</li>
                                <li>
                                    欲線上報名者，請先點選右上角註冊帳號後，填寫基本資料和繳費，方可在研討會當天簽到時領取名牌。
                                </li>
                                <li>其他事項將在未來公告。</li>
                                {/* <li>全文(不含摘要)以2頁為限</li>
                                <li>
                                    論文發表形式將由Oral 或Poster
                                    者，均需上傳「摘要」與「論文全文」。
                                </li>
                                <li>海報尺寸為 90 cm x 120 cm</li> */}
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                            <h3 className="text-xl font-medium mb-3 text-blue-800 text-center">
                                論文發表規定
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>投稿需要註冊帳號後才可以建立審稿案。</li>
                                <li>若全文被接受，需要完成繳費方可在會場發表。</li>
                                <li>請參照下載專區之格式與範本。</li>
                                {/* <li>口頭論文發表為15分鐘(口頭報告12分鐘、問答3分鐘)</li>
                                <li>壁報論文發表為3分鐘(含問答)</li>
                                <li>壁報競賽：發表人請於壁報張貼場地等候評審委員進行評分</li>
                                <li>
                                    口頭報告者請在提前到15分鐘至教室上傳簡報檔案，為避免軟體問題，報告時一律使用大會提供的電腦。簡報內建軟體為Office
                                    PowerPoint，若有其格式問題，可轉成PDF檔案。
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
