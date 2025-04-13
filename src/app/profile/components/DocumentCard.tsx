"use client";
import DocumentUploader from "./DocumentUploader";
import DocumentViewer from "@/app/components/DocumentViewer";

const DocumentCard = ({ pdfType, documents }) => {
    return (
        <div
            style={{
                marginBottom: "2rem",
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
            }}
        >
            <div>
                <h1>Manage your {pdfType}!</h1>
                {documents.length === 0 ? (
                    <p style={{ color: "#777" }}>尚未上傳任何檔案。</p>
                ) : (
                    documents.map((doc, i) => (
                        <div key={doc.pdfId || i} style={{ marginTop: "1rem" }}>
                            <DocumentViewer fileUrl={`/api/user_uploads${doc.pdf}`} />
                            <p>{JSON.stringify(doc, null, 2)}</p>
                            <button
                                onClick={async () => {
                                    const res = await fetch(`/api/documents/${doc.pdfId}`, {
                                        method: "POST",
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        alert("✅ 成功送出審稿！");
                                        console.log("response:", data);
                                    } else {
                                        alert(`❌ 送出失敗: ${data.error}`);
                                    }
                                }}
                                style={{
                                    marginTop: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                📤 送出審稿！
                            </button>
                        </div>
                    ))
                )}
            </div>
            <DocumentUploader pdfType={pdfType} />
        </div>
    );
};

export default DocumentCard;
