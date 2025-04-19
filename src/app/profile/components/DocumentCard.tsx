// "use client";
// import DocumentUploader from "./DocumentUploader";
// import DocumentViewer from "@/app/components/DocumentViewer";

// const DocumentCard = ({ pdfType, documents }) => {
//     return (
//         <div
//             style={{
//                 marginBottom: "2rem",
//                 border: "1px solid #ccc",
//                 padding: "1rem",
//                 borderRadius: "8px",
//             }}
//         >
//             <div>
//                 <h1>Manage your {pdfType}!</h1>
//                 {documents.length === 0 ? (
//                     <p style={{ color: "#777" }}>尚未上傳任何檔案。</p>
//                 ) : (
//                     documents.map((doc, i) => (
//                         <div key={doc.pdfId || i} style={{ marginTop: "1rem" }}>
//                             <p> Title: {doc.title}</p>

//                             <DocumentViewer fileUrl={`/api/user_uploads${doc.pdf}`} />
//                             <button
//                                 onClick={async () => {
//                                     const res = await fetch(`/api/documents/${doc.pdfId}`, {
//                                         method: "POST",
//                                     });
//                                     const data = await res.json();
//                                     if (res.ok) {
//                                         alert("✅ 成功送出審稿！");
//                                         console.log("response:", data);
//                                     } else {
//                                         alert(`❌ 送出失敗: ${data.error}`);
//                                     }
//                                 }}
//                                 style={{
//                                     marginTop: "0.5rem",
//                                     padding: "0.5rem 1rem",
//                                     backgroundColor: "#4CAF50",
//                                     color: "white",
//                                     border: "none",
//                                     borderRadius: "4px",
//                                     cursor: "pointer",
//                                 }}
//                             >
//                                 📤 送出審稿！
//                             </button>
//                             <button
//                                 onClick={async () => {
//                                     const res = await fetch("/api/attendee/remove_document", {
//                                         method: "POST",
//                                         headers: { "Content-Type": "application/json" },
//                                         body: JSON.stringify({
//                                             pdfId: doc.pdfId,
//                                             pdftype: pdfType,
//                                         }),
//                                     });
//                                     const data = await res.json();
//                                     if (res.ok) {
//                                         alert("🗑️ 成功移除檔案！");
//                                         location.reload();
//                                     } else {
//                                         alert(`❌ 移除失敗: ${data.error}`);
//                                     }
//                                 }}
//                                 style={{
//                                     marginTop: "0.5rem",
//                                     marginLeft: "0.5rem",
//                                     padding: "0.5rem 1rem",
//                                     backgroundColor: "#f44336",
//                                     color: "white",
//                                     border: "none",
//                                     borderRadius: "4px",
//                                     cursor: "pointer",
//                                 }}
//                             >
//                                 🗑️ 移除檔案
//                             </button>
//                         </div>
//                     ))
//                 )}
//             </div>
//             <DocumentUploader pdfType={pdfType} />
//         </div>
//     );
// };

// export default DocumentCard;
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DocumentUploader from "./DocumentUploader";
import DocumentViewer from "@/app/components/DocumentViewer";
import { useState } from "react";
const DocumentCard = ({ pdfType, documents }) => {
    const [uploading, setUploading] = useState(false);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Manage your {pdfType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {documents.length === 0 ? (
                    <p className="text-muted-foreground">尚未上傳任何檔案。</p>
                ) : (
                    documents.map((doc, i) => (
                        // <div key={doc.pdfId || i} className="space-y-2">
                        //     <p className="text-lg font-semibold">📄 文件標題: {doc.title}</p>
                        //     <p className="text-sm text-muted-foreground">
                        //         上傳時間: {new Date(doc.createdAt).toLocaleString()}
                        //     </p>

                        //     <DocumentViewer fileUrl={`/api/user_uploads${doc.pdf}`} />
                        //     <div className="flex gap-2">
                        //         <Button
                        //             variant="default"
                        //             onClick={async () => {
                        //                 const res = await fetch(`/api/documents/${doc.pdfId}`, {
                        //                     method: "POST",
                        //                 });
                        //                 const data = await res.json();
                        //                 if (res.ok) {
                        //                     alert(`✅ 成功送出審稿: ${data.message}`);
                        //                 } else {
                        //                     alert(`❌ 送出失敗: ${data.error}`);
                        //                 }
                        //             }}
                        //         >
                        //             📤 送出審稿
                        //         </Button>
                        //         <Button
                        //             variant="destructive"
                        //             onClick={async () => {
                        //                 const res = await fetch("/api/attendee/remove_document", {
                        //                     method: "POST",
                        //                     headers: { "Content-Type": "application/json" },
                        //                     body: JSON.stringify({
                        //                         pdfId: doc.pdfId,
                        //                         pdftype: pdfType,
                        //                     }),
                        //                 });
                        //                 const data = await res.json();
                        //                 if (res.ok) {
                        //                     alert("🗑️ 成功移除檔案！");
                        //                     location.reload();
                        //                 } else {
                        //                     alert(`❌ 移除失敗: ${data.error}`);
                        //                 }
                        //             }}
                        //         >
                        //             🗑️ 移除檔案
                        //         </Button>
                        //     </div>
                        //     <Separator className="my-4" />
                        // </div>
                        <div key={doc.pdfId || i} className="space-y-2">
                            {doc.status !== "pending" ? (
                                <details>
                                    <summary className="cursor-pointer font-semibold text-lg text-gray-700">
                                        📄 文件標題：{doc.title}（已送審）
                                    </summary>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            上傳時間: {new Date(doc.uploadedAt).toLocaleString()}
                                        </p>
                                        <DocumentViewer fileUrl={`/api/user_uploads${doc.pdf}`} />
                                        <Separator className="my-4" />
                                    </div>
                                    <p>{JSON.stringify(doc)}</p>
                                </details>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold">
                                        📄 文件標題: {doc.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        上傳時間: {new Date(doc.createdAt).toLocaleString()}
                                    </p>
                                    <DocumentViewer fileUrl={`/api/user_uploads${doc.pdf}`} />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            onClick={async () => {
                                                setUploading(true);
                                                const res = await fetch(
                                                    `/api/documents/${doc.pdfId}`,
                                                    {
                                                        method: "POST",
                                                    }
                                                );
                                                setUploading(false);
                                                const data = await res.json();
                                                if (res.ok) {
                                                    alert(`✅ 成功送出審稿: ${data.message}`);
                                                } else {
                                                    alert(`❌ 送出失敗: ${data.error}`);
                                                }
                                            }}
                                        >
                                            {uploading ? "送出中..." : "📤 送出審稿"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={async () => {
                                                const res = await fetch(
                                                    "/api/attendee/remove_document",
                                                    {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            pdfId: doc.pdfId,
                                                            pdftype: pdfType,
                                                        }),
                                                    }
                                                );
                                                const data = await res.json();
                                                if (res.ok) {
                                                    alert("🗑️ 成功移除檔案！");
                                                    location.reload();
                                                } else {
                                                    alert(`❌ 移除失敗: ${data.error}`);
                                                }
                                            }}
                                        >
                                            🗑️ 移除檔案
                                        </Button>
                                    </div>
                                    <Separator className="my-4" />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* uploader 放最下面 */}
                <DocumentUploader pdfType={pdfType} />
            </CardContent>
        </Card>
    );
};

export default DocumentCard;
