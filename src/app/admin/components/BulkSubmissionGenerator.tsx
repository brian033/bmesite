"use client";
import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Upload, FileUp } from "lucide-react";

// 審查案主題
const TOPICS = [
    "生物產業機械",
    "生物生產工程",
    "畜牧自動化與污染防治",
    "農業設施與環控工程",
    "生物機電控制",
    "生醫工程與微奈米機電",
    "生物資訊與系統",
    "能源與節能技術",
    "AI與大數據分析",
    "精準農業智動化",
    "農機安全",
    "其他新興科技",
];

// 發表形式
const PRESENTATION_TYPES = ["poster", "oral", "undecided"];

// 可能的標題詞彙
const TITLE_WORDS = [
    "智慧",
    "農業",
    "生物",
    "機械",
    "系統",
    "設計",
    "研究",
    "分析",
    "開發",
    "應用",
    "效率",
    "優化",
    "整合",
    "自動化",
    "監控",
    "感測",
    "數據",
    "工程",
    "科技",
    "控制",
    "精準",
    "測量",
    "模型",
    "演算法",
    "網路",
    "設備",
    "資源",
    "環境",
    "永續",
    "創新",
    "評估",
    "實驗",
    "方法",
    "結構",
    "功能",
    "改良",
    "管理",
    "節能",
    "減碳",
    "智能",
    "機器學習",
    "物聯網",
    "大數據",
    "雲端",
    "人工智慧",
    "綠能",
    "循環",
    "栽培",
    "灌溉",
    "養殖",
    "無人",
    "遙控",
    "追蹤",
];

// 可能的描述詞彙
const DESCRIPTION_WORDS = [
    "本研究探討",
    "我們開發了",
    "這項技術能夠",
    "實驗結果表明",
    "分析顯示",
    "系統整合了",
    "該設計提供",
    "此方法可以",
    "測試證明",
    "數據顯示",
    "我們提出了",
    "模型預測",
    "應用案例說明",
    "效能評估顯示",
    "比較研究指出",
    "初步結果顯示",
    "長期監測表明",
    "田間試驗證實",
    "實驗室模擬顯示",
    "農民回饋指出",
    "成本分析表明",
    "效率提升顯著",
    "能源消耗減少",
    "自動化程度提高",
    "精準度達到",
    "誤差範圍在",
    "系統穩定性強",
    "易於操作和維護",
    "實用性高",
    "市場潛力大",
];

const BulkSubmissionGenerator = () => {
    const [count, setCount] = useState<number>(10);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [successCount, setSuccessCount] = useState<number>(0);
    const [errorCount, setErrorCount] = useState<number>(0);
    const [logs, setLogs] = useState<string[]>([]);

    // 存儲上傳的 PDF 文件
    const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 處理文件上傳
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setUploadedPdf(file);
            setLogs([`已上傳 PDF: ${file.name} (${formatFileSize(file.size)})`]);
        }
    };

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    };

    // 生成隨機標題
    const generateRandomTitle = () => {
        const length = Math.floor(Math.random() * 3) + 3; // 3-5 個詞
        const title = ["[壓力測試生成]--"];

        for (let i = 0; i < length; i++) {
            const wordIndex = Math.floor(Math.random() * TITLE_WORDS.length);
            title.push(TITLE_WORDS[wordIndex]);
        }

        return (
            title.join("") +
            "之" +
            ["研究", "分析", "應用", "開發", "設計"][Math.floor(Math.random() * 5)]
        );
    };

    // 生成隨機描述
    const generateRandomDescription = () => {
        const length = Math.floor(Math.random() * 3) + 2; // 2-4 個句子
        const description = [];

        for (let i = 0; i < length; i++) {
            const sentenceIndex = Math.floor(Math.random() * DESCRIPTION_WORDS.length);
            description.push(
                DESCRIPTION_WORDS[sentenceIndex] +
                    ["。", "，並且提高了效率。", "，結果令人滿意。"][Math.floor(Math.random() * 3)]
            );
        }

        return description.join(" ");
    };

    // 修改 createSubmission 函數，確保參數名稱與類型正確

    // 創建並提交一個審查案
    const createSubmission = async () => {
        try {
            if (!uploadedPdf) {
                throw new Error("請先上傳一個PDF文件");
            }

            // 建立隨機資料
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            const presentType =
                PRESENTATION_TYPES[Math.floor(Math.random() * PRESENTATION_TYPES.length)];
            const title = generateRandomTitle();
            const description = generateRandomDescription();

            // 使用上傳的PDF但改名
            const pdfFile = new File([uploadedPdf], `${title}.pdf`, { type: "application/pdf" });

            // 建立FormData - 確保與 DocumentUploader2 的參數名稱一致
            const formData = new FormData();
            formData.append("file", pdfFile);
            formData.append("pdftype", "abstracts"); // 這裡使用 "pdftype" 作為 key
            formData.append("title", title);
            formData.append("description", description);
            formData.append("topic", topic);
            formData.append("presentType", presentType);

            // 發送請求
            const response = await fetch("/api/attendee/upload_document_and_submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "提交失敗");
            }

            return { success: true, title };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // 開始批量生成
    const startBulkGeneration = async () => {
        if (count <= 0) return;
        if (!uploadedPdf) {
            alert("請先上傳一個PDF文件");
            return;
        }

        setIsGenerating(true);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);
        setLogs((prev) => [...prev, `開始生成 ${count} 個審查案...`]);

        let completed = 0;

        for (let i = 0; i < count; i++) {
            const result = await createSubmission();
            completed++;

            if (result.success) {
                setSuccessCount((prev) => prev + 1);
                setLogs((prev) => [...prev, `✅ 成功創建: ${result.title}`]);
            } else {
                setErrorCount((prev) => prev + 1);
                setLogs((prev) => [...prev, `❌ 失敗: ${result.error}`]);
            }

            // 更新進度
            const newProgress = Math.round((completed / count) * 100);
            setProgress(newProgress);

            // 小延遲，避免伺服器過載
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        setIsGenerating(false);
        setLogs((prev) => [...prev, `✅ 完成! 成功: ${successCount}, 失敗: ${errorCount}`]);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-center text-2xl">批量生成審查案</CardTitle>
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        警告：此工具僅用於系統壓力測試，請勿在生產環境中使用。
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* PDF 文件上傳區域 */}
                    <div className="space-y-1">
                        <Label>上傳一個PDF文件 (將用於所有提交)</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <FileUp className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                                {uploadedPdf
                                    ? `已選擇: ${uploadedPdf.name} (${formatFileSize(
                                          uploadedPdf.size
                                      )})`
                                    : "點擊上傳 PDF 文件"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>要生成的審查案數量</Label>
                        <Input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                            min="1"
                            max="1000"
                        />
                    </div>

                    <Button
                        onClick={startBulkGeneration}
                        disabled={isGenerating || count <= 0 || !uploadedPdf}
                        className="w-full"
                    >
                        {isGenerating ? `生成中 (${successCount}/${count})` : "開始生成"}
                    </Button>

                    {isGenerating && (
                        <div className="space-y-2">
                            <Label>進度: {progress}%</Label>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {(successCount > 0 || errorCount > 0) && (
                        <Alert
                            className={
                                errorCount > 0
                                    ? "bg-red-50 border-red-200"
                                    : "bg-green-50 border-green-200"
                            }
                        >
                            <AlertDescription className="flex items-center gap-2">
                                {errorCount > 0 ? (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                成功: {successCount} | 失敗: {errorCount}
                            </AlertDescription>
                        </Alert>
                    )}

                    {logs.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <Label>日誌</Label>
                            <div className="border rounded p-2 bg-gray-50 h-48 overflow-y-auto text-xs font-mono">
                                {logs.map((log, index) => (
                                    <div key={index} className="py-1">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default BulkSubmissionGenerator;
