import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Award, Star } from 'lucide-react';

// 定義贊助商資訊
const sponsors = [
    {
        name: "三久股份有限公司",
        poster: "/sponsors/sponsor_1.jpg",
        description: "",
    },
    {
        name: "上舜貿易股份有限公司",
        poster: "/sponsors/sponsor_2.jpg", 
        description: "",
    },
    {
        name: "雲菱農機股份有限公司",
        poster: "/sponsors/sponsor_3.jpg",
        description: "",
    },
    {
        name: "祐麟實業有限公司",
        poster: "/sponsors/sponsor_4.jpg", 
        description: "",
    },
];

export default function SponsorsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* 主要內容 */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-center mb-6">贊助廠商</h1>
                    <p className="text-center text-gray-600 max-w-2xl mx-auto">
                        感謝以下企業與機構對本次研討會的大力支持，讓我們能夠成功舉辦這場學術盛會，促進生機與農機領域的知識交流與技術發展。
                    </p>
                </div>

                {/* 贊助商展示區塊 */}
                <div className="space-y-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {sponsors.map((company, companyIndex) => (
                        <Card
                            key={companyIndex}
                            className="border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
                        >
                            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200 py-6">
                                <CardTitle className="text-xl font-bold text-green-800 text-center">
                                    {company.name}
                                </CardTitle>
                                {company.description && (
                                    <p className="text-center text-gray-600 mt-2">
                                        {company.description}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                                    <img
                                        src={company.poster}
                                        alt={`${company.name} 海報`}
                                        className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}