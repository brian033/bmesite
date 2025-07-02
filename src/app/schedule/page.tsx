import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";

// 定義議程資料結構
const conferenceSchedule = {
    title: "2025 生機與農機學術研討會大會議程",
    dates: "114年9月25-26日（星期四~五）",
    location: "國立臺灣大學生物機電工程系 系館",
    days: [
        {
            date: "114年9月25日(四)",
            events: [
                {
                    time: "09:00-09:30",
                    activity: "開放報到",
                    location: "生機館1F",
                    details: ["開放報到時間: 09:00 ~ 14:00"],
                },
                {
                    time: "09:30-10:00",
                    activity: "開幕典禮暨台灣生物機電學會年會",
                    location: "鄭江樓信義講堂",
                },
                {
                    time: "10:00-10:30",
                    activity: "開幕、貴賓致詞、捐贈與頒獎儀式、大合照時間",
                    location: "鄭江樓信義講堂",
                },
                {
                    time: "10:30-11:05",
                    activity: "Plenary Speech I",
                    location: "鄭江樓信義講堂",
                    details: [
                        "主持人: 台灣生物機電學會邱奕志 理事長",
                        "主講人: 農業科技司李紅曦司長",
                        "演講題目: (未定)",
                    ],
                },
                {
                    time: "11:05-11:40",
                    activity: "Plenary Speech II",
                    location: "鄭江樓信義講堂",
                    details: [
                        "主持人: 台灣生物機電學會邱奕志 理事長",
                        "主講人: 中興大學詹富智校長",
                        "演講題目: (未定)",
                    ],
                },
                {
                    time: "11:40-12:10",
                    activity: "特別講者：中華農機學會國際貢獻獎",
                    location: "鄭江樓信義講堂",
                    details: [
                        "主講人: Dr. Sun-Ok Chung",
                        "Chungnam National University, Korea",
                    ],
                },
                {
                    time: "12:30-13:30",
                    activity: "中華農業機械學會年會",
                    location: "知武館4F演講廳",
                    parallel: "午餐",
                    parallelLocation: "知武館及生機館教室",
                },
                {
                    time: "13:30-15:20",
                    activity: "研發成果口頭發表",
                    location: "知武館及生機館",
                    parallel: "研發成果壁報發表",
                    parallelLocation: "知武館穿堂、2F走廊",
                },
                { time: "15:20-15:40", activity: "茶敘", location: "生機館1F" },
                {
                    time: "15:40-17:30",
                    activity: "研發成果口頭發表",
                    location: "知武館及生機館",
                    parallel: "農機安全論壇",
                    parallelLocation: "知武館4F演講廳",
                },
                {
                    time: "18:00-20:30",
                    activity: "晚宴",
                    location: "公館薪僑園水源婚宴會館",
                },
            ],
        },
        {
            date: "114年9月26日(五)",
            events: [
                { time: "09:00-10:50", activity: "研發成果口頭發表", location: "知武館及生機館" },
                {
                    time: "11:30-12:00",
                    activity: "口頭競賽頒獎及閉幕典禮",
                    location: "知武館4F演講廳",
                },
                /*{
                    time: "晚上",
                    activity: "晚宴",
                    location: "公館薪僑園水源婚宴會館",
                },*/
            ],
        },
    ],
};

export default function SchedulePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 頂部橫幅 */}
            {/* <div className="relative w-full h-[30vh]">
                <Image
                    src="/webpage/banner.JPG"
                    fill
                    alt="2025 生機與農機學術研討會"
                    className="object-cover"
                    priority
                />
            </div> */}

            {/* 主要內容 */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-center mb-2">
                        {conferenceSchedule.title}
                    </h1>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8 text-center">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-green-700 mr-2" />
                            <span>{conferenceSchedule.dates}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-green-700 mr-2" />
                            <span>{conferenceSchedule.location}</span>
                        </div>
                    </div>
                </div>

                {/* 會議日程表 */}
                <div className="space-y-12">
                    {conferenceSchedule.days.map((day, dayIndex) => (
                        <div
                            key={dayIndex}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-green-100"
                        >
                            {/* 日期標題 */}
                            <div className="bg-green-50 p-4 border-b border-green-200">
                                <h2 className="text-xl font-semibold text-center">{day.date}</h2>
                            </div>

                            {/* 活動列表 */}
                            <div className="divide-y divide-gray-100">
                                {day.events.map((event, eventIndex) => (
                                    <div key={eventIndex} className="p-4 hover:bg-gray-50">
                                        <div className="flex flex-col md:flex-row md:gap-4">
                                            {/* 時間欄 */}
                                            <div className="flex items-start md:w-1/6 mb-2 md:mb-0">
                                                <Clock className="h-4 w-4 text-green-700 mr-2 mt-1 flex-shrink-0" />
                                                <span className="font-medium">{event.time}</span>
                                            </div>

                                            {/* 活動內容 */}
                                            <div className="md:w-5/6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-green-800">
                                                            {event.activity}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            <MapPin className="h-3 w-3 inline mr-1" />
                                                            {event.location}
                                                        </p>

                                                        {/* 詳細內容（如果有） */}
                                                        {event.details && (
                                                            <div className="mt-2 ml-3 pl-2 border-l-2 border-green-200">
                                                                {event.details.map((detail, i) => (
                                                                    <p
                                                                        key={i}
                                                                        className="text-sm text-gray-700"
                                                                    >
                                                                        {detail}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 平行活動（如果有） */}
                                                    {event.parallel && (
                                                        <div className="border-l border-gray-200 pl-4">
                                                            <h3 className="font-semibold text-green-800">
                                                                {event.parallel}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                <MapPin className="h-3 w-3 inline mr-1" />
                                                                {event.parallelLocation}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 註解資訊 */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2">注意事項</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>議程可能會有所調整，請以現場公告為準</li>
                    </ul>
                </div>

                {/* 下載按鈕 */}
                {/* <div className="flex justify-center mt-8">
                    <a
                        href="#"
                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        下載完整議程
                    </a>
                </div> */}
            </div>
        </div>
    );
}
