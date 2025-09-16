import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Award, Star } from "lucide-react";

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
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center mb-6">贊助廠商</h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            感謝以下企業與機構對本次研討會的大力支持，讓我們能夠成功舉辦這場學術盛會，促進生機與農機領域的知識交流與技術發展。
          </p>
        </div>

        {/* 關鍵：不要用 space-y-*；改用 gap，並讓每列等高 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-[1fr] max-w-6xl mx-auto">
          {sponsors.map((company, i) => (
            <Card
              key={i}
              className="h-full flex flex-col border-2 border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
            >
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200 py-6">
                <CardTitle className="text-xl font-bold text-green-800 text-center">
                  {company.name}
                </CardTitle>
                {company.description && (
                  <p className="text-center text-gray-600 mt-2">{company.description}</p>
                )}
              </CardHeader>

              {/* 讓內容區塊可撐高，卡片等高 */}
              <CardContent className="p-6 flex-1 flex">
                {/* 固定長寬比容器，所有圖片看起來一樣高 */}
                <div className="relative w-full rounded-lg overflow-hidden shadow-inner bg-gray-100 aspect-[3/4] mx-auto">
                  <img
                    src={company.poster}
                    alt={`${company.name} 海報`}
                    className="absolute inset-0 w-full h-full object-contain"
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
