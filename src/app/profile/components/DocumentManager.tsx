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
        return <p>載入中...</p>; // 或你要顯示 spinner、骨架螢幕都可以
    }
    return (
        <div>
            <DocumentCard key="1" pdfType={"abstracts"} documents={documents?.abstracts} />
            <DocumentCard key="2" pdfType={"poster"} documents={documents?.poster} />
            <DocumentCard key="3" pdfType={"final_paper"} documents={documents?.final_paper} />
            <DocumentCard key="4" pdfType={"others"} documents={documents?.others} />
        </div>
    );
};

export default DocumentManager;
