// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// export default function Navbar() {
//     const { data: session, status } = useSession();
//     const user = session?.user as { name?: string; email?: string; image?: string; role?: string };
//     const router = useRouter();
//     return (
//         <nav
//             style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 backgroundColor: "#46663d",
//                 color: "white",
//                 padding: "1rem 2rem",
//                 fontFamily: "sans-serif",
//             }}
//         >
//             {/* 左側：標題 */}
//             <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>2025 農機與生機學術研討會</div>

//             {/* 中間：導覽列 */}
//             <div
//                 style={{ display: "flex", gap: "1rem", fontSize: "0.95rem", alignItems: "center" }}
//             >
//                 <Link href="/">首頁</Link>
//                 <Link href="/conference">研討會</Link>
//                 <Link href="/speakers">專題講者</Link>
//                 <Link href="/schedule">大會議程</Link>
//                 <Link href="/travel">住宿與交通</Link>
//                 <Link href="/downloads">檔案下載</Link>
//                 {/* 只要有 sign in 就可以看到這個 */}
//                 {user && (
//                     <Link
//                         href="/profile"
//                         style={{
//                             backgroundColor: "black",
//                             color: "white",
//                             padding: "0.3rem 0.6rem",
//                             borderRadius: "4px",
//                             fontWeight: "bold",
//                         }}
//                     >
//                         個人頁面
//                     </Link>
//                 )}
//                 {/* 依 role 顯示額外按鈕 */}
//                 {user?.role === "admin" && (
//                     <Link
//                         href="/admin/user_management"
//                         style={{
//                             backgroundColor: "#cc0000",
//                             color: "white",
//                             padding: "0.3rem 0.6rem",
//                             borderRadius: "4px",
//                             fontWeight: "bold",
//                         }}
//                     >
//                         管理使用者
//                     </Link>
//                 )}
//                 {(user?.role === "reviewer" || user?.role === "admin") && (
//                     <>
//                         <Link
//                             href="/reviewer/pending"
//                             style={{
//                                 backgroundColor: "#eab308", // yellow
//                                 color: "#000",
//                                 padding: "0.3rem 0.6rem",
//                                 borderRadius: "4px",
//                                 fontWeight: "bold",
//                             }}
//                         >
//                             待審稿件
//                         </Link>
//                         <Link
//                             href="/reviewer/reviewed"
//                             style={{
//                                 backgroundColor: "#84cc16", // green
//                                 color: "#000",
//                                 padding: "0.3rem 0.6rem",
//                                 borderRadius: "4px",
//                                 fontWeight: "bold",
//                             }}
//                         >
//                             已審稿件
//                         </Link>
//                     </>
//                 )}
//             </div>

//             {/* 右側：登入 / 使用者資訊 */}
//             <div>
//                 {status === "loading" ? (
//                     <span>載入中...</span>
//                 ) : user ? (
//                     <>
//                         <span style={{ marginRight: "1rem" }}>Hi, {user.name}</span>
//                         <button
//                             onClick={async () => {
//                                 await signOut();
//                                 // redirect to home page after sign out
//                                 router.push("/");
//                             }}
//                             style={buttonStyle}
//                         >
//                             登出
//                         </button>
//                     </>
//                 ) : (
//                     <button onClick={() => signIn("google")} style={buttonStyle}>
//                         Google登入
//                     </button>
//                 )}
//             </div>
//         </nav>
//     );
// }

// const buttonStyle = {
//     backgroundColor: "white",
//     color: "#46663d",
//     padding: "0.4rem 0.8rem",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontWeight: "bold",
// };

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { data: session, status } = useSession();
    const user = session?.user as { name?: string; email?: string; image?: string; role?: string };
    const router = useRouter();

    return (
        <nav className="flex justify-between items-center bg-primary text-white px-8 py-4 font-sans">
            <div className="font-bold text-lg">2025 農機與生機學術研討會</div>

            <div className="flex gap-4 text-sm items-center">
                <Link href="/">首頁</Link>
                <Link href="/conference">研討會</Link>
                <Link href="/speakers">專題講者</Link>
                <Link href="/schedule">大會議程</Link>
                <Link href="/travel">住宿與交通</Link>
                <Link href="/downloads">檔案下載</Link>

                {user && (
                    <Link href="/profile">
                        <Button className="bg-lime-400 text-black hover:bg-lime-300" size="sm">
                            個人頁面
                        </Button>
                    </Link>
                )}
                {(user?.role === "reviewer" || user?.role === "admin") && (
                    <>
                        <Link href="/reviewer">
                            <Button
                                className="bg-yellow-400 text-black hover:bg-yellow-300"
                                size="sm"
                            >
                                待審介面
                            </Button>
                        </Link>
                    </>
                )}

                {user?.role === "admin" && (
                    <Link href="/admin/user_management">
                        <Button variant="destructive" size="sm">
                            管理使用者
                        </Button>
                    </Link>
                )}

                {user?.role === "admin" && (
                    <Link href="/admin/payments">
                        <Button variant="destructive" size="sm">
                            金流查詢
                        </Button>
                    </Link>
                )}
            </div>

            <div>
                {status === "loading" ? (
                    <span>載入中...</span>
                ) : user ? (
                    <div className="flex items-center gap-4">
                        <span>Hi, {user.name}</span>
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
