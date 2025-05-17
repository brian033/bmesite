export function formatToUTC8(date: string | Date | number) {
    const d = new Date(date);
    // 取得 UTC+8 時間字符串
    const utc8Date = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return utc8Date.toISOString().replace("T", " ").slice(0, 19);
}
