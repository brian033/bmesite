import { ObjectId } from "mongodb";

export type User = {
    _id?: ObjectId;
    registered: boolean;
    name: string;
    email: string;
    image: string;
    uuid: string;
    role: string;
    createdAt: string;
    contact_email: string;
    phone: string;
    department: string;
    payment: {
        paid: boolean;
        payment_id: string[];
    };
    uploaded_pdfs: {
        abstracts: UploadedPdf[];
        full_paper: UploadedPdf[];
    };
    submission: {
        abstracts: string[];
        full_paper: string[];
    };
    reviewing_whitelist?: Array<"oral" | "poster" | "undecided">;
    presentation_type?: string[];
};

export type UploadedPdf = {
    pdf: string;
    uploadedAt: string;
    documentType: "abstracts" | "full_paper";
    pdfId: string;
    title: string;
    description: string;
};
