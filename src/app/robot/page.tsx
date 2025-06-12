import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    CalendarDays,
    MapPin,
    Download,
    Trophy,
    FileText,
    CreditCard,
    Users,
    ExternalLink,
    Info,
} from "lucide-react";
import Link from "next/link";
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
                <h1 className="text-3xl font-bold mb-2 text-center">
                    2025 三久生物機電盃全國田間機器人競賽
                </h1>
                {/* 這邊可以打簡介喔～ */}
                {/* <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">簡介</p> */}
                <div className="flex justify-center my-4">
                    <Image
                        src="/robot/robot_poster.jpg"
                        alt="田間機器人比賽"
                        className="object-cover"
                        width={700}
                        height={900}
                    />
                </div>

                {/* 競賽資訊卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* 左側：基本資訊 */}
                    <Card className="border border-green-100 shadow-md">
                        <CardHeader className="bg-green-50 border-green-100 py-4">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <Info className="h-6 w-6 text-green-700" />
                                競賽基本資訊
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {/* <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">競賽主題</h3>
                                    <p>ＸＸＸＸ</p>
                                </div>
                            </div> */}

                            <div className="flex items-start gap-3">
                                <CalendarDays className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">競賽日期</h3>
                                    <p>2025年09月25日</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium">競賽地點</h3>
                                    <p>國立臺灣大學農機館前草皮、生機館102室</p>
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">田間機器人比賽群組</h3>
                                        <p>掃描QR code加入</p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p></p>
                                    <Image
                                        src="/robot/line_qrcode.jpg"
                                        width={150}
                                        height={150}
                                        alt="line invite"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 右側：報名與繳費 */}
                    <Card className="border border-green-100 shadow-md">
                        <CardHeader className="bg-green-50 border-green-100 py-4">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                                <CreditCard className="h-5 w-5 text-green-700" />
                                競賽報名及繳費
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p>報名需先繳交報名費1000元，於競賽報到當天全額退費</p>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="font-medium mb-2">繳費帳戶</h3>
                                <div className="text-sm space-y-1">
                                    <p>中華郵政-宜蘭大學郵局（700）</p>
                                    <p>帳號：01111040097421</p>
                                    <p>戶名：台灣生物機電學會邱奕志</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">報名網頁</h3>
                                <Link
                                    href={
                                        "https://docs.google.com/forms/d/e/1FAIpQLScxtSy1Ea1927PwUww48Ynu6pCN3IOE9_s7DywurG3-EUhdPA/viewform"
                                    }
                                    target="_blank"
                                >
                                    <Button className="gap-2 bg-green-700 hover:bg-green-800">
                                        <ExternalLink className="h-4 w-4" />
                                        前往報名網站
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 獎項資訊 */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-green-700" />
                        競賽獎項
                    </h2>

                    <Card className="border border-green-100 shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-green-50">
                                    <TableRow>
                                        <TableHead className="font-bold">獎項</TableHead>
                                        <TableHead className="font-bold">大專生組</TableHead>
                                        <TableHead className="font-bold">高中職組</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">第一名</TableCell>
                                        <TableCell>獎金 30,000 元</TableCell>
                                        <TableCell>獎金 15,000 元</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">第二名</TableCell>
                                        <TableCell>獎金 20,000 元</TableCell>
                                        <TableCell>獎金 10,000 元</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">第三名</TableCell>
                                        <TableCell>獎金 10,000 元</TableCell>
                                        <TableCell>獎金 5,000 元</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* 相關資料下載 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Download className="h-6 w-6 text-green-700" />
                        相關資料下載
                    </h2>

                    <Card className="border border-green-100 shadow-md">
                        <CardContent className="py-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-green-700" />
                                        <span>田間機器人海報PDF檔</span>
                                    </div>
                                    <Link href="/robot/robot_poster.pdf" target="_blank" download>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            下載
                                        </Button>
                                    </Link>
                                </div>

                                <div className="text-center text-gray-500 pt-2">
                                    <p className="mb-4">更多田間機器人比賽相關文件將陸續公布</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-sm text-gray-500 mt-12">
                    <p>如有任何疑問，請聯繫競賽主辦單位</p>
                </div>
            </div>
        </div>
    );
}
