"use client";
import { useState, useEffect } from "react";
import AbstractDraftCard from "./AbstractDraftCard";
import { UserDocumentIndexResponse } from "@/app/api/attendee/user_document_index/route";
import DocumentUploader from "./DocumentUploader";
import DocumentUploader2 from "./DocumentUploader2";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import SubmissionCard from "./SubmissionCard";
import { UploadedPdf } from "@/types/user";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";

const DocumentManager = ({ session }) => {
    const [userDocumentIndex, setUserDocumentIndex] = useState<UserDocumentIndexResponse | null>(
        null
    );
    const [showUploader, setShowUploader] = useState(false);

    // 拆分狀態以便單獨更新
    const [documents, setDocuments] = useState<Document[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    // const [uploadedDocumentList, setUploadedDocumentList] = useState<Document[]>([]);

    // 初始載入數據
    useEffect(() => {
        async function fetchDocuments() {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const res = await fetch(`${baseUrl}/api/attendee/user_document_index`);
            const data = (await res.json()) as UserDocumentIndexResponse;

            if (!("error" in data)) {
                setUserDocumentIndex(data);
                setDocuments(data.documents);
                setSubmissions(data.submissions);

                // // 計算已上傳但未提交的文件
                // const uploadedDocument: UploadedPdf[] = session.user.uploaded_pdfs["abstracts"];
                // const uploadedDocumentIds = uploadedDocument.map((doc) => doc.pdfId);
                // const draftDocs = data.documents.filter((doc) => {
                //     return (
                //         uploadedDocumentIds.includes(doc.documentId) &&
                //         doc.documentStatus === "uploaded"
                //     );
                // });
                // setUploadedDocumentList(draftDocs);
            }
        }
        fetchDocuments();
    }, [session]);

    // 處理新上傳的文件
    const handleNewDocumentUploaded = (newDocument: Document) => {
        // 更新文件列表
        setDocuments((prev) => [...prev, newDocument]);
        // 更新草稿文件列表
        // setUploadedDocumentList((prev) => [...prev, newDocument]);
        // 上傳成功後關閉上傳表單
        setShowUploader(false);
    };

    // // 處理文件刪除
    // const handleDocumentRemoved = (documentId: string) => {
    //     // 從文件列表和草稿列表中移除
    //     setDocuments((prev) => prev.filter((doc) => doc.documentId !== documentId));
    //     setUploadedDocumentList((prev) => prev.filter((doc) => doc.documentId !== documentId));
    // };

    // // 處理文件提交審核
    // const handleDocumentSubmitted = (documentId: string, newSubmission: Submission) => {
    //     // 從草稿列表移除
    //     setUploadedDocumentList((prev) => prev.filter((doc) => doc.documentId !== documentId));
    //     // 添加到提交列表
    //     setSubmissions((prev) => [...prev, newSubmission]);
    // };

    const handleSubmissionCreated = (newSubmission: Submission) => {
        // 添加到提交列表
        setSubmissions((prev) => [...prev, newSubmission]);

        // 注意：不需要更新 uploadedDocumentList，因為這個文件直接變成了 submission，
        // 而且在直接提交的情况下文件状态已经是 "pending" 而不是 "uploaded"
    };

    const toggleUploader = () => {
        setShowUploader(!showUploader);
    };

    if (!userDocumentIndex) {
        return <p className="text-gray-600 text-center">📄 文件載入中...</p>;
    }
    if ("error" in userDocumentIndex) {
        return (
            <p className="text-gray-600 text-center">📄 文件載入失敗: {userDocumentIndex.error}</p>
        );
    }

    // const hasUploadedDocuments = uploadedDocumentList.length > 0;

    return (
        <div className="flex gap-6 overflow-x-auto pb-4">
            <div className="w-full">
                <h1 className="text-3xl font-semibold text-gray-800">文件管理</h1>
                {/* 顯示提交列表 */}
                {submissions && <SubmissionCard submissions={submissions} documents={documents} />}

                {/* 20250526暫時移除，老師說不要這塊。 */}
                {/* 顯示草稿列表 */}
                {/* {hasUploadedDocuments && (
                    <div className="my-4">
                        <AbstractDraftCard
                            documents={uploadedDocumentList}
                            onDocumentRemoved={handleDocumentRemoved}
                            onDocumentSubmitted={handleDocumentSubmitted}
                        />
                    </div>
                )} */}

                {/* 文件上傳區塊 */}
                {/* 舊版workflow, 先暫時拿掉 */}
                {/* {showUploader ? (
                    <div className="border p-4 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">上傳新文件</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleUploader}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <DocumentUploader
                            pdfType="abstracts"
                            onDocumentUploaded={handleNewDocumentUploaded}
                        />
                    </div>
                ) : (
                    <Button onClick={toggleUploader} variant="outline" className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        上傳新摘要草稿
                    </Button>
                )} */}
                {showUploader ? (
                    <div className="border p-4 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">上傳新文件</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleUploader}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <DocumentUploader2
                            pdfType="abstracts"
                            onDocumentUploaded={handleNewDocumentUploaded}
                            onSubmissionCreated={handleSubmissionCreated}
                        />
                    </div>
                ) : (
                    <Button onClick={toggleUploader} variant="outline" className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        新摘要送審
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
