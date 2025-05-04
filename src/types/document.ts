import { ObjectId } from "mongodb";

export type Document = {
    _id?: ObjectId;
    documentId: string;
    documentLocation: string;
    documentOwner: string;
    documentStatus: "pending" | "uploaded";
    title: string;
    pdfType: "abstracts" | "full_paper";
    topic: string;
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
