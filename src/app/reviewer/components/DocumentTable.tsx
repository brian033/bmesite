"use client";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

export default function DocumentTable({ status }) {
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        async function fetchDocs() {
            const res = await fetchWithAuth(`/api/reviewer/get_docs_by_status?status=${status}`);
            if (!res.ok) return;
            const data = await res.json();
            setDocs(data);
        }

        fetchDocs();
    });

    return (
        <div>
            {docs.map((doc) => (
                <div key={doc.documentId} style={{ marginBottom: "2rem" }}>
                    <p>{JSON.stringify(doc)}</p>
                </div>
            ))}
        </div>
    );
}
