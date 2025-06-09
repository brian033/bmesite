import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Car,
    Train,
    Bus,
    Hotel,
    MapPin,
    ExternalLink,
    Phone,
    Info,
    Navigation,
} from "lucide-react";

// 定義住宿資訊
const accommodations = [
    {
        name: "台大尊賢會館",
        address: "106台北市大安區復興南路二段340號",
        phone: "02-2378-5288",
        distance: "距離會場 0.5 公里",
        description: "台大專屬會館，價格合理且交通便利，鄰近捷運大安站。",
        website: "https://www.resthouse.org.tw/",
        image: "/travel/hotel.jpeg",
    },
    {
        name: "福華國際文教會館",
        address: "106台北市大安區新生南路三段30號",
        phone: "02-7712-2323",
        distance: "距離會場 1.2 公里",
        description: "提供學術團體特別優惠，環境舒適安靜，適合學術活動住宿。",
        website: "https://www.howard-hotels.com.tw/zh-tw/inspire/",
        image: "/travel/hotel.jpeg",
    },
    {
        name: "集思台大會議中心",
        address: "106台北市大安區羅斯福路四段85號B1",
        phone: "02-2363-5868",
        distance: "距離會場 0.8 公里",
        description: "位於台灣大學內，學術氛圍濃厚，交通便利。",
        website: "https://www.meeting.com.tw/ntu/",
        image: "/travel/hotel.jpeg",
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
                    alt="2025 農機與生機學術研討會"
                    className="object-cover"
                    priority
                />
            </div> */}

            {/* 主要內容 */}
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-2 text-center">交通與住宿資訊</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    國立台灣大學位於台北市大安區，交通便利，可透過多種方式抵達。
                    以下提供交通指南及住宿建議，協助您順利參與研討會。
                </p>

                {/* 會場資訊 */}
                <div className="mb-12 bg-white p-6 rounded-lg shadow-md border border-green-100">
                    <div className="flex items-start gap-3 mb-4">
                        <MapPin className="h-6 w-6 text-green-700 flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-xl font-semibold mb-1">會場地點</h2>
                            <p className="text-lg font-medium">國立台灣大學生物機電工程學系</p>
                            <p className="text-gray-600">106台北市大安區羅斯福路四段1號</p>
                        </div>
                    </div>

                    <div className="mt-6 aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                        <div className="absolute inset-0">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.47544070795!2d121.54023707537601!3d25.017934377826663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442aa2429043393%3A0xcfa54254447302e2!2z5ZyL56uL6Ie654Gj5aSn5a2455Sf54mp5qmf6Zu75bel56iL5a2457O7!5e0!3m2!1szh-TW!2stw!4v1749455183869!5m2!1szh-TW!2stw"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* 交通資訊 */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Info className="h-6 w-6 text-green-700" />
                        <h2 className="text-2xl font-semibold">交通方式</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 開車 */}
                        <Card>
                            <CardHeader className="bg-green-50 border-b border-green-100">
                                <div className="flex items-center gap-2">
                                    <Car className="h-5 w-5 text-green-700" />
                                    <CardTitle>開車</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-1">國道一號（中山高）</h4>
                                        <p className="text-gray-600 text-sm">
                                            圓山交流道下 → 建國南北快速道路 → 左轉和平東路 →
                                            右轉復興南路 → 左轉羅斯福路 → 台大校區
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">
                                            國道三號（福爾摩沙高速公路）
                                        </h4>
                                        <p className="text-gray-600 text-sm">
                                            木柵交流道下 → 辛亥路 → 右轉羅斯福路 → 台大校區
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">停車資訊</h4>
                                        <p className="text-gray-600 text-sm">
                                            台大校內停車位有限，建議利用台大週邊公共停車場或大安區路邊停車格。研討會期間校內將開放特定區域供與會者停車，請依現場指示牌引導。
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 捷運 */}
                        <Card>
                            <CardHeader className="bg-green-50 border-b border-green-100">
                                <div className="flex items-center gap-2">
                                    <Train className="h-5 w-5 text-green-700" />
                                    <CardTitle>捷運</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-1">捷運路線</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            搭乘台北捷運松山新店線（綠線）至
                                            <span className="font-medium">公館站</span>下車
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            <li>
                                                從公館站<span className="font-medium">1號出口</span>
                                                出站
                                            </li>
                                            <li>沿著羅斯福路四段步行約8分鐘</li>
                                            <li>轉入台大校門口，依指標抵達生機系館</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">其他鄰近捷運站</h4>
                                        <p className="text-gray-600 text-sm">
                                            亦可搭乘捷運文湖線（棕線）至
                                            <span className="font-medium">大安森林公園站</span>
                                            ，轉乘公車或步行約15-20分鐘可達會場。
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 公車 */}
                        <Card>
                            <CardHeader className="bg-green-50 border-b border-green-100">
                                <div className="flex items-center gap-2">
                                    <Bus className="h-5 w-5 text-green-700" />
                                    <CardTitle>公車</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-1">台大公館站</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            可搭乘以下路線至「台大公館站」或「台灣大學站」下車：
                                        </p>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                74、235
                                            </div>
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                237、252
                                            </div>
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                278、284
                                            </div>
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                290、311
                                            </div>
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                505、635
                                            </div>
                                            <div className="bg-gray-50 rounded px-2 py-1">
                                                907、綠11
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">台大校內公車</h4>
                                        <p className="text-gray-600 text-sm">
                                            台大校內備有免費接駁專車，可於校內各站點候車，接駁車路線圖請見會場指引。
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 住宿資訊 */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Hotel className="h-6 w-6 text-green-700" />
                        <h2 className="text-2xl font-semibold">住宿建議</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {accommodations.map((hotel, index) => (
                            <Card key={index}>
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={hotel.image}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                                        <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                            {hotel.distance}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <p className="text-gray-600">{hotel.description}</p>

                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span>{hotel.address}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{hotel.phone}</span>
                                        </div>

                                        <a
                                            href={hotel.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span>前往官網</span>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="flex items-start text-amber-700">
                            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                            研討會期間為台北住宿旺季，建議提早預訂住宿。會議單位已與部分飯店洽談團體優惠價，預訂時請註明參加「2025生機與農機學術研討會」以享優惠。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
