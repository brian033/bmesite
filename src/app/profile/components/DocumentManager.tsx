// "use client";
// import { useState, useEffect } from "react";
// import DocumentCard from "./DocumentCard";
// import {UserDocumentIndexResponse} from "@/app/api/attendee/user_document_index/route";

// const DocumentManager = () => {
//     const [documents, setDocuments] = useState(null);

//     useEffect(() => {
//         async function fetchDocuments() {
//             const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
//             const res = await fetch(`${baseUrl}/api/attendee/user_document_index`);
//             const data = await res.json();
//             setDocuments(data);
//         }
//         fetchDocuments();
//     }, []);

//     if (!documents) {
//         return <p className="text-gray-600 text-center">📄 文件載入中...</p>;
//     }

//     return documents.submissions.full_paper.length > 0 ? (
//         <div className="flex gap-6 overflow-x-auto pb-4">
//             {/* <DocumentCard key="abstracts" pdfType="abstracts" documents={documents.abstracts} />
//             <DocumentCard key="full_paper" pdfType="full_paper" documents={documents.full_paper} /> */}

//             <div className="min-w-[50%]">
//                 <DocumentCard
//                     key="abstracts"
//                     pdfType="abstracts"
//                     documents={documents.abstracts}
//                     submissions={documents.submissions.abstracts}
//                 />
//             </div>
//             <div className="min-w-[50%]">
//                 <DocumentCard
//                     key="full_paper"
//                     pdfType="full_paper"
//                     documents={documents.full_paper}
//                     submissions={documents.submissions.full_paper}
//                 />
//             </div>
//         </div>
//     ) : (
//         <div className="flex gap-6 overflow-x-auto pb-4">
//             {/* <DocumentCard key="abstracts" pdfType="abstracts" documents={documents.abstracts} />
//             <DocumentCard key="full_paper" pdfType="full_paper" documents={documents.full_paper} /> */}

//             <div className="min-w-[100%]">
//                 <DocumentCard
//                     key="abstracts"
//                     pdfType="abstracts"
//                     documents={documents.abstracts}
//                     submissions={documents.submissions.abstracts}
//                 />
//             </div>
//         </div>
//     );
// };

// export default DocumentManager;

"use client";
import { useState, useEffect } from "react";
import DocumentCard from "./DocumentCard";
import { UserDocumentIndexResponse } from "@/app/api/attendee/user_document_index/route";
import DocumentUploader from "./DocumentUploader";
const DocumentManager = ({ session }) => {
    const [userDocumentIndex, setUserDocumentIndex] = useState<UserDocumentIndexResponse | null>(
        null
    );

    useEffect(() => {
        async function fetchDocuments() {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const res = await fetch(`${baseUrl}/api/attendee/user_document_index`);
            const data = (await res.json()) as UserDocumentIndexResponse;
            setUserDocumentIndex(data);
        }
        fetchDocuments();
    }, []);

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
                    {/* uploader 放最下面 */}
                    <DocumentUploader pdfType={"abstracts"} add_new_title={true} />
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex gap-6 overflow-x-auto pb-4">
                {/* <DocumentCard key="abstracts" pdfType="abstracts" documents={documents.abstracts} />
            <DocumentCard key="full_paper" pdfType="full_paper" documents={documents.full_paper} /> */}

                <div className="min-w-[50%]">
                    <DocumentCard
                        key="abstracts"
                        pdfType="abstracts"
                        documents={userDocumentIndex.documents}
                        submissions={submissions.abstracts}
                        session={session}
                    />
                    {/* uploader 放最下面 */}
                    <DocumentUploader pdfType={"abstracts"} add_new_title={true} />
                </div>
                <div className="min-w-[50%]">
                    <DocumentCard
                        key="full_paper"
                        pdfType="full_paper"
                        documents={userDocumentIndex.documents}
                        submissions={submissions.full_paper}
                        session={session}
                    />
                </div>
            </div>
        );
    }
};

export default DocumentManager;
