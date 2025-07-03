import Image from "next/image";
import { Calendar, User, Globe, BookOpen, Info } from "lucide-react";

// 定義專題講者資料結構
const speakers = [
    {
        title: "Plenary Speech I",
        titleEn: "Plenary Speech I",
        speaker: "李紅曦 司長",
        speakerEn: "Lee, Hung-Hsi",
        position: "農業部 農業科技司司長",
        positionEn: "",
        photoUrl: "/speakers/speaker1.jpg", // 預設圖片，請替換為實際照片
        host: "邱奕志 理事長",
        hostTitle: "台灣生物機電學會理事長",
        topic: "(未定)",
        topicEn: "(TBD)",
        notes: "",
    },
    {
        title: "Plenary Speech II",
        titleEn: "Plenary Speech II",
        speaker: "詹富智 校長",
        speakerEn: "Jan, Fuh-Jyh",
        position: "國立中興大學校長",
        // positionEn: "President of National Chung Hsing University",
        photoUrl: "/speakers/speaker2.jpg", // 預設圖片，請替換為實際照片
        host: "邱奕志 理事長",
        hostTitle: "台灣生物機電學會理事長",
        topic: "(未定)",
        topicEn: "(TBD)",
        notes: "",
    },
];

export default function Page() {
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
                    <h1 className="text-3xl font-bold text-center mb-6">大會專題講者</h1>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto">
                        2025年生機與農機學術研討會邀請到各領域頂尖專家學者，分享其專業知識與前瞻觀點，為與會者帶來豐富的學術交流。
                    </p>
                </div>

                {/* 講者列表 */}
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {speakers.map((speaker, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-green-100 hover:shadow-lg transition-shadow w-full"
                        >
                            <div className="bg-green-50 p-4 border-b border-green-200">
                                <h2 className="text-xl font-semibold text-center text-green-800">
                                    {speaker.title}
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* 講者照片 */}
                                    <div className="md:w-1/3 flex justify-center items-start">
                                        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                            <Image
                                                src={speaker.photoUrl}
                                                alt={speaker.speaker}
                                                fill
                                                className="object-cover rounded-full"
                                                sizes="(max-width: 768px) 100vw, 256px"
                                            />
                                        </div>
                                    </div>

                                    {/* 講者資訊 */}
                                    <div className="md:w-2/3 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-green-700" />
                                                <h3 className="text-xl font-semibold">
                                                    {speaker.speaker}
                                                </h3>
                                            </div>
                                            <p className="text-gray-500 pl-7">
                                                {speaker.speakerEn}
                                            </p>
                                            <p className="text-gray-700 pl-7 mt-1">
                                                {speaker.position}
                                            </p>
                                            <p className="text-gray-500 text-sm pl-7">
                                                {speaker.positionEn}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-green-700" />
                                                <h4 className="font-medium">演講主題</h4>
                                            </div>
                                            <p className="text-gray-700 pl-7">{speaker.topic}</p>
                                            <p className="text-gray-500 text-sm pl-7">
                                                {speaker.topicEn}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="h-5 w-5 text-green-700 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium">主持人</h4>
                                                    <p className="text-gray-700">{speaker.host}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {speaker.hostTitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {speaker.notes && (
                                            <div>
                                                <div className="flex items-start gap-2">
                                                    <Info className="h-5 w-5 text-green-700 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium">備註</h4>
                                                        <p className="text-gray-700">
                                                            {speaker.notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 補充信息 */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600">更多講者資訊將陸續公佈，敬請期待。</p>
                </div>
            </div>
        </div>
    );
}
