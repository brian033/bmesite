import { ObjectId } from "mongodb";
export type Submission = {
    _id?: ObjectId;
    submissionId: string;
    submissionTitle: string;
    submissionType: "abstracts" | "full_paper";
    submissionStatus: "pending" | "replied" | "rejected" | "approved"; //new
    submissionTopic: string; // new
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
