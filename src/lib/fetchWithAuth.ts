export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ""; // 預設會是空字串，在本地開發時可用
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

    const mergedOptions: RequestInit = {
        ...options,
        credentials: "include", // 🔐 確保攜帶 cookie (含 next-auth session)
        headers: {
            ...(options.headers || {}),
            "Content-Type": options.body instanceof FormData ? undefined : "application/json",
        },
    };

    return fetch(url, mergedOptions);
}
