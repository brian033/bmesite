export type ImportantDate = {
    title: string;
    date: string; // 如 "2024-08-01"
    displayText: string; // 如 "2024年8月1日"
    isExtended?: boolean; // 是否為延長後的日期
    originalDate?: string; // 原始日期 (用於顯示被延長的日期)
    originalDisplayText?: string; // 原始日期的顯示文字
};
