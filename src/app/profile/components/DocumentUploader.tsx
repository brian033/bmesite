"use client";

import { useState } from "react";

const DocumentUploader = ({ pdfType }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [noteTitle, setNoteTitle] = useState("");
    const [noteDescription, setNoteDescription] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Please upload a valid PDF file.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("No file selected");
            return;
        }

        if (!noteTitle.trim() || !noteDescription.trim()) {
            setError("Please enter both title and description.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pdftype", pdfType);
        formData.append("title", noteTitle);
        formData.append("description", noteDescription);

        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/attendee/upload_documents", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setSuccessMessage(`File uploaded successfully: ${data.filePath}`);
        } catch (err) {
            setError(err.message || "Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "300px",
                margin: "0 auto",
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                color: "black",
            }}
        >
            <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
                Upload Document
            </h2>
            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
                <div>
                    <label>PDF File:</label>
                    <input type="file" accept="application/pdf" onChange={handleFileChange} />
                </div>

                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Enter title"
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea
                        value={noteDescription}
                        onChange={(e) => setNoteDescription(e.target.value)}
                        placeholder="Enter description"
                        style={{
                            resize: "none",
                            height: "100px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "8px",
                        }}
                    />
                </div>

                {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
                {successMessage && (
                    <p style={{ color: "green", fontSize: "14px" }}>{successMessage}</p>
                )}

                <button
                    type="submit"
                    disabled={uploading}
                    style={{
                        backgroundColor: "#4caf50",
                        color: "black",
                        border: "none",
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    {uploading ? "Uploading..." : "Upload PDF"}
                </button>
            </form>
        </div>
    );
};

export default DocumentUploader;
