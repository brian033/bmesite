"use client";
import { useState, useEffect } from "react";
import DocumentCard from "./DocumentCard";
import { UserDocumentIndexResponse } from "@/app/api/attendee/user_document_index/route";
import DocumentUploader from "./DocumentUploader";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";

const DocumentManager = ({ session }) => {
    const [userDocumentIndex, setUserDocumentIndex] = useState<UserDocumentIndexResponse | null>(
        null
    );
    // 添加狀態控制上傳元件的顯示
    const [showUploader, setShowUploader] = useState(false);

    useEffect(() => {
        async function fetchDocuments() {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const res = await fetch(`${baseUrl}/api/attendee/user_document_index`);
            const data = (await res.json()) as UserDocumentIndexResponse;
            setUserDocumentIndex(data);
        }
        fetchDocuments();
    }, []);

    // 切換上傳元件的顯示狀態
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

    const full_paper_submissions = userDocumentIndex.submissions.filter(
        (submission) => submission.submissionType === "full_paper"
    );
    const abstract_submissions = userDocumentIndex.submissions.filter(
        (submission) => submission.submissionType === "abstracts"
    );
    const submissions = {
        abstracts: abstract_submissions,
        full_paper: full_paper_submissions,
    };

    // if there's no full paper submission, show only abstracts
    if (full_paper_submissions.length === 0) {
        return (
            <div className="flex gap-6 overflow-x-auto pb-4">
                <div className="min-w-[100%]">
                    <DocumentCard
                        key="abstracts"
                        pdfType="abstracts"
                        documents={userDocumentIndex.documents}
                        submissions={submissions.abstracts}
                        session={session}
                    />

                    {/* 替換為按鈕和條件渲染上傳元件 */}
                    <div className="mt-4">
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
                                <DocumentUploader pdfType={"abstracts"} add_new_title={true} />
                            </div>
                        ) : (
                            <Button onClick={toggleUploader} variant="outline" className="w-full">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                上傳新摘要
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex gap-6 overflow-x-auto pb-4">
                <div className="min-w-[50%]">
                    <DocumentCard
                        key="abstracts"
                        pdfType="abstracts"
                        documents={userDocumentIndex.documents}
                        submissions={submissions.abstracts}
                        session={session}
                    />

                    {/* 替換為按鈕和條件渲染上傳元件 */}
                    <div className="mt-4">
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
                                <DocumentUploader pdfType={"abstracts"} add_new_title={true} />
                            </div>
                        ) : (
                            <Button onClick={toggleUploader} variant="outline" className="w-full">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                上傳新摘要
                            </Button>
                        )}
                    </div>
                </div>
                {submissions.full_paper && submissions.full_paper.length > 0 && (
                    <div className="min-w-[50%]">
                        <DocumentCard
                            key="full_paper"
                            pdfType="full_paper"
                            documents={userDocumentIndex.documents}
                            submissions={submissions.full_paper}
                            session={session}
                        />
                    </div>
                )}
            </div>
        );
    }
};

export default DocumentManager;
