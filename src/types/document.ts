import { ObjectId } from "mongodb";

export type Document = {
    _id?: ObjectId | string;
    documentId: string;
    documentLocation: string;
    documentOwner: string;
    documentStatus: "pending" | "uploaded";
    title: string;
    pdfType: "abstracts" | "full_paper";
    topic:
        | "生物產業機械"
        | "生物生產工程"
        | "畜牧自動化與污染防治"
        | "農業設施與環控工程"
        | "生物機電控制"
        | "生醫工程與微奈米機電"
        | "生物資訊與系統"
        | "能源與節能技術"
        | "AI與大數據分析"
        | "精準農業智動化"
        | "其他新興科技";
    present_type: "oral" | "poster";
    description: string;
    notes: note[];
    createdAt: string;
    isReviewerUpload?: boolean;
    reviewerId?: string;
    reviewerName?: string;
    originalSubmissionId?: string;
};

export type note = {
    note: string;
    createdAt: string;
    noteCreatorId: string;
    noteCreatorName: string;
};
