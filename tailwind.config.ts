/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"], // 支援暗色模式
    content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#3f6212", // 你自定義的主色，例如深綠色
                    foreground: "#ffffff", // 按鈕字色、反白用
                },
                secondary: {
                    DEFAULT: "#eab308", // 黃色
                    foreground: "#000000",
                },
                // 更多自定義 color...
            },
            borderRadius: {
                lg: "1rem",
                md: "0.5rem",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
