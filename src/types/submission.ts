export type Submission = {
    _id: string;
    submissionId: string;
    submissionTitle: string;
    submissionType: "abstracts" | "full_paper";
    submissionStatus: "pending" | "replied" | "rejected" | "approved"; //new
    submissionTopic: string; // new
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
