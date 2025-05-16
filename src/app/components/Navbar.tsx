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
                    <Link href="/conference" className="py-2 lg:py-0">
                        研討會
                    </Link>
                    <Link href="/speakers" className="py-2 lg:py-0">
                        專題講者
                    </Link>
                    <Link href="/schedule" className="py-2 lg:py-0">
                        大會議程
                    </Link>
                    <Link href="/travel" className="py-2 lg:py-0">
                        住宿與交通
                    </Link>
                    <Link href="/downloads" className="py-2 lg:py-0">
                        檔案下載
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

            {/* 漢堡菜單按鈕與登入按鈕並排 - 只在小螢幕顯示 */}
            <div className="lg:hidden flex items-center gap-2">
                {!user && (
                    <Button
                        onClick={() => signIn("google")}
                        variant="secondary"
                        size="sm"
                        className="text-xs py-1 px-2"
                    >
                        登入
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
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
                <Link
                    href="/conference"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                >
                    研討會
                </Link>
                <Link
                    href="/speakers"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                >
                    專題講者
                </Link>
                <Link
                    href="/schedule"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10  "
                >
                    大會議程
                </Link>
                <Link
                    href="/travel"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                >
                    住宿與交通
                </Link>
                <Link
                    href="/downloads"
                    onClick={handleNavItemClick}
                    className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                >
                    檔案下載
                </Link>
                <div className="hidden lg:block border-l border-primary-foreground/20 h-6" />
                {user && (
                    <Link
                        href="/profile"
                        onClick={handleNavItemClick}
                        className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                    >
                        個人頁面
                    </Link>
                )}
                {(user?.role === "reviewer" || user?.role === "admin") && (
                    <Link
                        href="/reviewer"
                        onClick={handleNavItemClick}
                        className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                    >
                        待審介面
                    </Link>
                )}
                {user?.role === "admin" && (
                    <>
                        <Link
                            href="/admin/user_management"
                            onClick={handleNavItemClick}
                            className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                        >
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-30% lg:w-auto flex justify-end "
                            >
                                管理使用者
                            </Button>
                        </Link>
                        <Link
                            href="/admin/payments"
                            onClick={handleNavItemClick}
                            className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10"
                        >
                            <Button variant="destructive" size="sm" className="w-30% lg:w-auto ">
                                金流查詢
                            </Button>
                        </Link>
                    </>
                )}
                <div className="lg:hidden">
                    {status === "loading" ? (
                        <span>載入中...</span>
                    ) : user ? (
                        <div className="py-2 lg:py-0 flex justify-end lg:mx-0 mx-10">
                            {/* <span className="text-center">Hi, {user.name}</span> */}
                            <Button
                                onClick={async () => {
                                    await signOut();
                                    router.push("/");
                                    setIsMenuOpen(false);
                                }}
                                variant="secondary"
                                size="sm"
                                className="w-30% lg:w-auto"
                            >
                                登出
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => signIn("google")}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                        >
                            使用Gmail登入/註冊
                        </Button>
                    )}
                </div>
            </div>

            {/* 使用者信息/登入按鈕 - 在桌面版顯示 */}
            <div className="hidden lg:block">
                {status === "loading" ? (
                    <span>載入中...</span>
                ) : user ? (
                    <div className="flex items-center gap-4">
                        <span className="hidden lg:inline">Hi, {user.name}</span>
                        <Button
                            onClick={async () => {
                                await signOut();
                                router.push("/");
                            }}
                            variant="secondary"
                            size="sm"
                        >
                            登出
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => signIn("google")} variant="secondary" size="sm">
                        使用Gmail登入/註冊
                    </Button>
                )}
            </div>
        </nav>
    );
}
