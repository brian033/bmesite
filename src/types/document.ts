export type Document = {
    _id: string;
    documentId: string;
    documentLocation: string;
    documentOwner: string;
    documentStatus: "pending" | "uploaded";
    title: string;
    pdfType: "abstracts" | "full_paper";
    description: string;
    reviewedBy: {
        reviewer_uuid?: string;
        reviewer: string;
        reviewerEmail: string;
        approved: boolean;
        note: string;
        reviewedAt: string;
    }[];
    notes: string[];
    createdAt: string;
};
