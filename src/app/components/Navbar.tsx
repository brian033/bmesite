"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const user = session?.user as { name?: string; email?: string; image?: string; role?: string };
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 只在客戶端渲染後顯示動態內容
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNavItemClick = () => {
        setIsMenuOpen(false);
    };

    // 避免服務端和客戶端渲染不一致，使用一個簡單的渲染模式
    if (!mounted) {
        return (
            <nav className="flex justify-between items-center bg-primary text-white px-4 lg:px-8 py-4 font-sans relative">
                <div className="font-bold text-sm lg:text-lg">2025 農機與生機學術研討會</div>
                {/* 靜態菜單（無交互） */}
                <div className="hidden lg:flex lg:gap-4 lg:items-center">
                    <Link href="/" className="py-2 lg:py-0">
                        首頁
                    </Link>
                </div>
                {/* 佔位符 */}
                <div className="hidden lg:block"></div>
            </nav>
        );
    }

    // 客戶端渲染，包含完整功能
    return (
        <nav className="flex justify-between items-center bg-primary text-white px-4 lg:px-8 py-4 font-sans relative">
            {/* Logo/標題 */}
            <div className="font-bold text-lg text-center lg:text-left flex-1 lg:flex-initial">
                2025 農機與生機學術研討會
            </div>

            {/* 主菜單 - 在桌面顯示為水平排列，在移動設備上顯示為浮動菜單 */}
            <div
                className={cn(
                    "lg:flex lg:gap-4 lg:items-center lg:static lg:flex-row lg:bg-transparent lg:p-0",
                    isMenuOpen
                        ? "absolute top-full left-0 right-0 flex flex-col bg-primary shadow-lg p-4 z-50 gap-4"
                        : "hidden"
                )}
            >
                <Link
                    href="/"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                >
                    首頁
                </Link>
            </div>
        </nav>
    );
}
