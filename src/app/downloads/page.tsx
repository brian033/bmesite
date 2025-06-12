import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, Calendar, Filter, FileText, BookOpen, Laptop } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// 定義下載檔案資訊
const downloadFiles = [
    {
        category: "2025生機與農機學術演討會",
        icon: <BookOpen className="h-6 w-6 text-green-700" />,
        files: [
            {
                name: "研討會海報",
                description: "歡迎列印張貼",
                path: "/webpage/poster.JPG",
                size: "6.4 MB",
                date: "2025-06-12",
            },
            // {
            //     name: "會議手冊",
            //     description: "會議須知與重要資訊",
            //     path: "/downloads/conference_handbook.pdf",
            //     size: "3.5 MB",
            //     date: "2025-05-15",
            // },
        ],
    },
    {
        category: "論文格式範本",
        icon: <FileText className="h-6 w-6 text-green-700" />,
        files: [
            {
                name: "摘要格式範本",
                description: "摘要投稿格式規範與範本",
                path: "/downloads/abstract_template.docx",
                size: "21 KB",
                date: "2025-06-10",
            },
            // {
            //     name: "論文全文格式範本",
            //     description: "論文全文投稿格式規範與範本",
            //     path: "/downloads/full_paper_template.docx",
            //     size: "42 KB",
            //     date: "2025-01-10",
            // },
            // {
            //     name: "論文投稿流程說明",
            //     description: "詳細的投稿步驟與注意事項",
            //     path: "/downloads/submission_guide.pdf",
            //     size: "1.8 MB",
            //     date: "2025-01-10",
            // },
        ],
    },
    {
        category: "2025 三久生物機電盃全國田間機器人競賽",
        icon: <Laptop className="h-6 w-6 text-green-700" />,
        files: [
            {
                name: "競賽海報",
                description: "歡迎列印張貼！",
                path: "/robot/robot_poster.pdf",
                size: "540 KB",
                date: "2025-06-12",
            },
            // {
            //     name: "技術規範說明",
            //     description: "參賽團隊須知與技術規範",
            //     path: "/downloads/technical_specifications.pdf",
            //     size: "1.5 MB",
            //     date: "2025-03-01",
            // },
            // {
            //     name: "報名表單",
            //     description: "競賽報名表格",
            //     path: "/downloads/registration_form.xlsx",
            //     size: "320 KB",
            //     date: "2025-03-01",
            // },
        ],
    },
];

export default function DownloadsPage() {
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
                <h1 className="text-3xl font-bold mb-2 text-center">資料下載</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    此頁面提供研討會相關的各項文件下載，包括會議資料、論文格式範本及其他相關資源。
                </p>

                {/* 檔案下載區塊 */}
                <div className="space-y-12">
                    {downloadFiles.map((category, index) => (
                        <div key={index}>
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-200 pb-2">
                                {category.icon}
                                {category.category}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.files.map((file, fileIndex) => (
                                    <Card
                                        key={fileIndex}
                                        className="border border-green-100 shadow-md"
                                    >
                                        <CardHeader className="bg-green-50 border-b border-green-100 py-4">
                                            <div className="flex items-start gap-3">
                                                <File className="h-6 w-6 text-green-700" />
                                                <CardTitle className="text-lg">
                                                    {file.name}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <p className="text-gray-600 mb-4">{file.description}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <span>檔案大小: {file.size}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{file.date}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Link href={file.path} className="w-full">
                                                <Button className="w-full bg-green-700 hover:bg-green-800">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    下載文件
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 提示信息 */}
                <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <p className="text-blue-800">如需額外資料或有任何問題，請聯繫我們</p>
                </div>
            </div>
        </div>
    );
}
