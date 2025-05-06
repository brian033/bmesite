import { withRoleProtection } from "@/lib/withRoleProtection";
import SubmissionReviewCard from "./components/SubmissionReviewCard";
import { Submission } from "@/types/submission";
import clientPromise from "@/lib/mongodb";
import { Collection } from "mongodb";
import { Document } from "@/types/document";
import { User } from "@/types/user";
function processParam(param: string | undefined): string[] | null {
    if (!param) {
        return null; // 如果 param 是 undefined，直接返回 null
    }

    try {
        const parsed = JSON.parse(param); // 嘗試解析 JSON
        if (Array.isArray(parsed)) {
            return parsed; // 如果解析結果是陣列，直接返回
        } else if (typeof parsed === "string") {
            return [parsed]; // 如果解析結果是單個字串，包裝成陣列返回
        }
    } catch (e) {
        console.error("Failed to parse param:", e); // 如果解析失敗，記錄錯誤
    }

    return null; // 如果解析失敗或格式不符合，返回 null
}

export type SubmissionWithDetailedInfo = Omit<Submission, "submissionOwner" | "submissionFiles"> & {
    submissionOwner: User;
    submissionFiles: Document[];
};

export default async function ReviewerPendingPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    await withRoleProtection(["reviewer", "admin"]);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const submissionDB = db.collection("submissions");
    const searchParamsAwaited = await searchParams;
    const params = processParam(searchParamsAwaited.submissions as string);

    let submissions: Submission[];
    if (!params) {
        // then search all
        submissions = (await submissionDB
            .find({})
            .toArray()
            .then((s) => {
                return s.map((submission) => ({
                    _id: submission._id.toString(),
                    ...submission,
                }));
            })) as Submission[];
    } else {
        submissions = (await submissionDB
            .find({ submissionId: { $in: params } })
            .toArray()
            .then((s) => {
                return s.map((submission) => ({
                    _id: submission._id.toString(),
                    ...submission,
                }));
            })) as Submission[];
    }

    const relatedUsersId = submissions.map((s) => s.submissionOwner);
    // 將 users的重複拿掉
    const uniqueRelatedUsersId = Array.from(new Set(relatedUsersId));
    const relatedDocumentsId = submissions.map((s) => s.submissionFiles).flat();
    // 撈資料
    const documentDB: Collection<Document> = db.collection("documents");
    const userDB: Collection<User> = db.collection("users");

    const relatedDocuments = (await documentDB
        .find({ documentId: { $in: relatedDocumentsId } })
        .toArray()
        .then((docs) => {
            return docs.map((doc) => {
                return {
                    _id: doc._id.toString(),
                    ...doc,
                };
            });
        })) as Document[];
    const relatedUsers = (await userDB
        .find({ uuid: { $in: uniqueRelatedUsersId } })
        .toArray()
        .then((users) => {
            return users.map((user) => {
                return {
                    _id: user._id.toString(),
                    ...user,
                };
            });
        })) as User[];
    // construct SubmissionWithDetailedInfo[]
    const submissionsWithDetailedInfo: SubmissionWithDetailedInfo[] = submissions.map(
        (submission) => {
            const submissionOwner = relatedUsers.find(
                (user) => user.uuid === submission.submissionOwner
            );
            const submissionFiles = relatedDocuments.filter((doc) =>
                submission.submissionFiles.includes(doc.documentId)
            );
            return {
                ...submission,
                submissionOwner: submissionOwner as User,
                submissionFiles: submissionFiles as Document[],
            };
        }
    );
    return <div></div>;
}
