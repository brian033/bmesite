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
        name: "捷絲旅臺大尊賢館",
        address: "台北市大安區羅斯福路四段83號",
        phone: "(02)7735-5088",
        distance: "距離會場 0.5 公里",
        description: "臺大教職員工生及校友憑證享住宿優惠價，義饗食堂餐飲九折優惠",
        website: "http://www.justsleep.com.tw/NTU/zh/index",
        image: "/travel/hotel1.jpg",
    },
    {
        name: "柯達大飯店台北敦南館",
        address: "台北市敦化南路二段238號",
        phone: "(02)2732-3333",
        distance: "距離會場 2.5 公里",
        description: "臺大教職員工生及校友，預先訂房時主動告知所屬身份，入住時憑臺大證件享優惠價",
        website: "http://dunnan.khotels.com.tw/zh-TW/",
        image: "/travel/hotel2.jpg",
    },
    {
        name: "福華國際文教會館",
        address: "台北市大安區新生南路三段30號",
        phone: "(02)7712-2323",
        distance: "距離會場 1.2 公里",
        description: "鄰近台大校區。",
        website: "https://www.howard-hotels.com.tw/zh_TW/HotelBusiness/96",
        image: "/travel/hotel3.jpg",
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
                            {/* <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.47544070795!2d121.54023707537601!3d25.017934377826663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442aa2429043393%3A0xcfa54254447302e2!2z5ZyL56uL6Ie654Gj5aSn5a2455Sf54mp5qmf6Zu75bel56iL5a2457O7!5e0!3m2!1szh-TW!2stw!4v1749455183869!5m2!1szh-TW!2stw"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe> */}
                            <Image
                                src="/travel/map.png"
                                alt="map"
                                width={800}
                                height={600}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
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
                            <CardHeader className="bg-green-50 border-green-100 py-4">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <Car className="h-5 w-5 text-green-700" />
                                    開車
                                </CardTitle>
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
                                            台大校內停車位有限，建議利用台大週邊公共停車場或大安區路邊停車格。
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 捷運 */}
                        <Card>
                            <CardHeader className="bg-green-50 border-green-100 py-4">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <Train className="h-5 w-5 text-green-700" />
                                    捷運
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-1">捷運路線1</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            搭乘台北捷運松山新店線（綠線）至
                                            <span className="font-medium">公館站</span>下車
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            <li>
                                                從公館站<span className="font-medium">2號出口</span>
                                                出站
                                            </li>
                                            <li>沿舟山路往東北走約 13 分鐘 </li>
                                            <li>左轉抵達生機系館</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">捷運路線2</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            搭乘台北捷運文湖線（棕線）至
                                            <span className="font-medium">科技大樓站</span>下車
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            <li>
                                                從科技大樓站
                                                <span className="font-medium">出口</span>
                                                出站
                                            </li>
                                            <li>沿復興南路二段往南走約13分 </li>
                                            <li>抵達生機系館</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 公車 */}
                        <Card>
                            <CardHeader className="bg-green-50 border-green-100 py-4">
                                <CardTitle className="flex items-center gap-3 text-2xl">
                                    <Train className="h-5 w-5 text-green-700" />
                                    公車
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-1">公車路線1</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            搭乘237, 295, 298, 949, 1068, 1550A 至
                                            <span className="font-medium">國青大樓站</span>下車
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            <li>沿辛亥路三段往西走約2分鐘（150 公尺） </li>
                                            <li>往南進入校園後再往南走約5分鐘（350公尺） </li>
                                            <li>抵達生機系館</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-1">公車路線2</h4>
                                        <p className="text-gray-600 text-sm mb-2">
                                            搭乘1, 207, 275, 295（副線）,672, 673, 688, 707, 905,
                                            906, 907, 909, 913, 935, 1550,基隆路幹線, 棕12, 棕22至
                                            <span className="font-medium">自來水處(基隆)站</span>
                                            下車
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            <li>沿長興街往西北走約4分鐘 (270公尺)</li>
                                            <li>抵達生機系館</li>
                                        </ul>
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
                        <h2 className="text-2xl font-semibold">住宿資訊</h2>
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
                            研討會期間為台北住宿旺季，建議提早預訂住宿。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
