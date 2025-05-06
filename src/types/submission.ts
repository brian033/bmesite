import { ObjectId } from "mongodb";
export type Submission = {
    _id?: ObjectId | string;
    submissionId: string;
    submissionTitle: string;
    submissionType: "abstracts" | "full_paper";
    submissionStatus: "pending" | "replied" | "rejected" | "approved" | "waiting"; //new
    submissionTopic:
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
    submissionPresentType: "oral" | "poster"; // new
    submissionOwner: string;
    submissionFiles: string[];
    submissionCreatedAt: string;
    submissionUpdatedAt: string;
    submissionReviewedBy: {
        index: number;
        reviewer: string;
        reviewerEmail: string;
        opinion: "approved" | "rejected";
        comment: string;
        reviewedAt: string;
    }[];
    submissionReviewedAt: string;
};
