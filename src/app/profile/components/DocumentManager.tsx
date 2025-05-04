"use client";
import { useState, useEffect } from "react";
import DocumentCard from "./DocumentCard";

const DocumentManager = () => {
    const [documents, setDocuments] = useState(null);

    useEffect(() => {
        async function fetchDocuments() {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const res = await fetch(`${baseUrl}/api/attendee/user_document_index`);
            const data = await res.json();
            setDocuments(data);
        }
        fetchDocuments();
    }, []);

    if (!documents) {
        return <p className="text-gray-600 text-center">📄 文件載入中...</p>;
    }

    return documents.submissions.full_paper.length > 0 ? (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {/* <DocumentCard key="abstracts" pdfType="abstracts" documents={documents.abstracts} />
            <DocumentCard key="full_paper" pdfType="full_paper" documents={documents.full_paper} /> */}

            <div className="min-w-[50%]">
                <DocumentCard
                    key="abstracts"
                    pdfType="abstracts"
                    documents={documents.abstracts}
                    submissions={documents.submissions.abstracts}
                />
            </div>
            <div className="min-w-[50%]">
                <DocumentCard
                    key="full_paper"
                    pdfType="full_paper"
                    documents={documents.full_paper}
                    submissions={documents.submissions.full_paper}
                />
            </div>
        </div>
    ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
            {/* <DocumentCard key="abstracts" pdfType="abstracts" documents={documents.abstracts} />
            <DocumentCard key="full_paper" pdfType="full_paper" documents={documents.full_paper} /> */}

            <div className="min-w-[100%]">
                <DocumentCard
                    key="abstracts"
                    pdfType="abstracts"
                    documents={documents.abstracts}
                    submissions={documents.submissions.abstracts}
                />
            </div>
        </div>
    );
};

export default DocumentManager;
