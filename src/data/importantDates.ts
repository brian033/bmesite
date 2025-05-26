export interface ImportantDate {
    title: string;
    date: string; // 如 "2024-08-01"
    displayText: string; // 如 "2024年8月1日"
    isExtended?: boolean; // 是否為延長後的日期
    originalDate?: string; // 原始日期 (用於顯示被延長的日期)
    originalDisplayText?: string; // 原始日期的顯示文字
}

const importantDates: ImportantDate[] = [
    {
        title: "摘要投稿截止",
        date: "2025-08-01",
        displayText: "2025年8月1日",
    },
    {
        title: "通知接受函",
        date: "2025-08-15",
        displayText: "2025年8月15日",
    },
    {
        title: "全文截稿",
        date: "2025-08-31",
        displayText: "2025年8月31日",
    },
    {
        title: "報名早鳥價截止",
        date: "2025-08-31",
        displayText: "2025年8月31日",
    },
    {
        title: "線上報名截止",
        date: "2025-09-12",
        displayText: "2025年9月12日",
    },
    {
        title: "田間機器人報名截止",
        date: "2025-08-15",
        displayText: "2025年8月15日",
    },
];

// // 延長日期的範例
// {
//   title: "摘要投稿截止",
//   date: "2024-08-10", // 新日期
//   displayText: "2024年8月10日", // 新日期的顯示文字
//   isExtended: true,
//   originalDate: "2024-08-01", // 原日期
//   originalDisplayText: "2024年8月1日" // 原日期的顯示文字
// },

export default importantDates;
