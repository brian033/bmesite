"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DocumentReviewCard({
    documentId,
    documentLocation,
    documentStatus,
    notes,
    createdAt,
    reviewedBy,
    ownerInfo,
}: {
    documentId: string;
    documentLocation: string;
    documentStatus: string;
    notes: string[];
    createdAt: string;
    reviewedBy: any[];
    ownerInfo: {
        name?: string;
        department?: string;
        email?: string;
        phone?: string;
    };
}) {
    const { data: session } = useSession();
    const reviewerEmail = session?.user?.email;
    const hasReviewed = reviewedBy?.some((r) => r.reviewerEmail === reviewerEmail);
    const [expanded, setExpanded] = useState(!hasReviewed);

    const [noteText, setNoteText] = useState("");
    const [reviewNote, setReviewNote] = useState("");
    const [approved, setApproved] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddNote = async () => {
        setIsSubmitting(true);
        const res = await fetch(`/api/documents/${documentId}/addnotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: noteText }),
        });
        setIsSubmitting(false);
        if (res.ok) {
            alert("新增備註成功！");
            setNoteText("");
        } else {
            alert("新增備註失敗！");
        }
    };

    const handleSubmitReview = async () => {
        setIsSubmitting(true);
        const res = await fetch(`/api/documents/${documentId}/addreview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                approved,
                note: reviewNote,
            }),
        });
        setIsSubmitting(false);
        if (res.ok) {
            alert("審稿提交成功！");
            setReviewNote("");
        } else {
            alert("審稿提交失敗！");
        }
    };

    const note = notes || ["無"];

    return (
        <div
            style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                backgroundColor: "#fefefe",
                color: "black",
            }}
        >
            {!expanded ? (
                <button
                    onClick={() => setExpanded(true)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    展開 (<span>{hasReviewed ? "已審核" : "待審核"}</span>)
                </button>
            ) : (
                <>
                    <h2 style={{ marginBottom: "0.5rem" }}>
                        📄 待審文件
                        <button
                            onClick={() => setExpanded(false)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            折疊
                        </button>
                    </h2>
                    <p>
                        <strong>作者：</strong>
                        {ownerInfo?.name || "未知"}
                    </p>
                    <p>
                        <strong>單位：</strong>
                        {ownerInfo?.department || "未知"}
                    </p>
                    <p>
                        <strong>備註：</strong>
                        {note.map((note, i) => (
                            <span key={i} style={{ display: "block", marginBottom: "0.5rem" }}>
                                {note}
                            </span>
                        ))}
                    </p>
                    <p>
                        <strong>目前審稿者：</strong>
                        {reviewedBy.length === 0
                            ? "無"
                            : reviewedBy.map((entry, i) => (
                                  <span
                                      key={i}
                                      style={{ display: "block", marginBottom: "0.5rem" }}
                                  >
                                      {entry.reviewer} ({entry.approved ? "通過" : "拒絕"}):{" "}
                                      {entry.note}
                                  </span>
                              ))}
                    </p>
                    <div style={{ marginTop: "1rem", gap: "1rem" }}>
                        <a
                            href={`/api/admin/user_uploads${documentLocation}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#1976d2",
                                color: "white",
                                borderRadius: "4px",
                                textDecoration: "none",
                            }}
                        >
                            查看文件（新分頁）
                        </a>
                        <details>
                            <summary
                                style={{
                                    cursor: "pointer",
                                    padding: "8px 16px",
                                    backgroundColor: "#888",
                                    color: "white",
                                    borderRadius: "4px",
                                    display: "inline-block",
                                    marginTop: "2rem",
                                }}
                            >
                                查看文件（預覽）
                            </summary>
                            <div style={{ marginTop: "1rem" }}>
                                <embed
                                    src={`/api/admin/user_uploads${documentLocation}`}
                                    width="100%"
                                    height="900px"
                                    type="application/pdf"
                                />
                            </div>
                        </details>
                    </div>

                    {/* 備註欄位 */}
                    <div style={{ marginTop: "1rem" }}>
                        <h4>新增備註：</h4>
                        <textarea
                            rows={3}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={isSubmitting || !noteText}
                            style={{
                                marginTop: "0.5rem",
                                padding: "8px 16px",
                                backgroundColor: "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            新增備註
                        </button>
                    </div>

                    {/* 審稿欄位 */}
                    <div style={{ marginTop: "1rem" }}>
                        <h4>審核文件：</h4>
                        <textarea
                            rows={3}
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="輸入審稿備註"
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                        <div style={{ margin: "0.5rem 0" }}>
                            <label>
                                <input
                                    type="radio"
                                    value="approve"
                                    checked={approved}
                                    onChange={() => setApproved(true)}
                                />
                                通過
                            </label>
                            <label style={{ marginLeft: "1rem" }}>
                                <input
                                    type="radio"
                                    value="reject"
                                    checked={!approved}
                                    onChange={() => setApproved(false)}
                                />
                                拒絕
                            </label>
                        </div>
                        <button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting || !reviewNote}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#d32f2f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            送出審核
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
