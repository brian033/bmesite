import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-TW" className="h-full">
            <body className="min-h-screen">
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        {/* 添加 pt-[60px] md:pt-[64px] 讓內容不會被固定導航欄覆蓋 */}
                        <main className="flex-grow w-full mx-auto ">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
