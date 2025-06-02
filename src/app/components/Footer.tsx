import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sponsors = [
    { name: "三久股份有限公司", url: "#" },
    { name: "行政院農業部農糧署", url: "#" },
    { name: "國立台灣大學", url: "#" },
    { name: "國立台灣大學生物資源暨農學院", url: "#" },
    { name: "國立台灣大學生物機電工程學系", url: "#" },
    { name: "國立台灣大智慧農業教學與研究發展中心", url: "#" },
    { name: "中華農業機械學會", url: "#" },
    { name: "生機學會", url: "#" },
    { name: "財團法人農業機械化研究發展中心", url: "#" },
    { name: "中華民國臺灣大學生機農機系友會", url: "#" },
    { name: "國立中興大學生物產業機電工程學系", url: "#" },
    { name: "國立宜蘭大學生物機電工程學系", url: "#" },
    { name: "國立嘉義大學生物機電工程學系", url: "#" },
    { name: "國立屏東科技大學生物機電工程學系", url: "#" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-white mt-auto">
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            2025 生機與農機學術研討會
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">主辦及協辦單位</p>
                        <div className="space-y-2">
                            {sponsors.map((sponsor, index) => (
                                <div key={index} className="text-sm">
                                    <Link
                                        href={sponsor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "text-gray-600 hover:text-blue-600 transition-colors",
                                            sponsor.url === "#" &&
                                                "pointer-events-none text-gray-500"
                                        )}
                                    >
                                        {sponsor.name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 relative">
                                <Image
                                    src="/logo/bime_logo.png"
                                    alt="BIME Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>國立台灣大學生物機電工程學系</p>
                            <p>10617 台北市大安區羅斯福路四段1號</p>
                            <p>電話: (02) 3366-5339</p>
                            <p>
                                Email:{" "}
                                <a href="mailto:bime@ntu.edu.tw" className="hover:text-blue-600">
                                    bime@ntu.edu.tw
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-500">
                            © {currentYear} 國立台灣大學生物機電工程學系. 版權所有.
                        </p>
                        <div className="mt-4 md:mt-0 flex space-x-4">
                            <Link
                                href="/privacy-policy"
                                className="text-sm text-gray-500 hover:text-blue-600"
                            >
                                隱私權政策
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-gray-500 hover:text-blue-600"
                            >
                                使用條款
                            </Link>
                            <Link
                                href="/contact"
                                className="text-sm text-gray-500 hover:text-blue-600"
                            >
                                聯絡我們
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
