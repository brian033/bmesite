"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types/user";
import { Document } from "@/types/document";
import { Submission } from "@/types/submission";
import { formatToUTC8 } from "@/lib/formatToUTC8";

export default function UserDetailCard({
    user,
    documents,
    submissions,
}: {
    user: User;
    documents: Document[];
    submissions: Submission[];
}) {
    const userDocs = documents.filter((doc) => doc.documentOwner === user.uuid);
    const userSubs = submissions.filter((sub) => sub.submissionOwner === user.uuid);

    return (
        <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="details">
                <AccordionTrigger className="text-sm text-muted-foreground">
                    使用者上傳文件與審稿資料
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">📄 文件列表</h4>
                        {userDocs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">尚無上傳文件</p>
                        ) : (
                            userDocs.map((doc) => (
                                <div key={doc.documentId} className="text-sm">
                                    <span className="font-medium">{doc.title}</span> -{" "}
                                    <Badge variant="outline">{doc.documentStatus}</Badge>
                                    <div className="text-xs text-muted-foreground">
                                        上傳於 {formatToUTC8(doc.createdAt)}
                                    </div>
                                    <Separator className="my-2" />
                                </div>
                            ))
                        )}
                    </div>

                    <div>
                        <h4 className="font-semibold">📝 審查案件</h4>
                        {userSubs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">尚無審查案件</p>
                        ) : (
                            userSubs.map((sub) => (
                                <div key={sub.submissionId} className="text-sm">
                                    <span className="font-medium">{sub.submissionTitle}</span> -{" "}
                                    <Badge>{sub.submissionStatus}</Badge>
                                    <div className="text-xs text-muted-foreground">
                                        最後更新時間 {formatToUTC8(sub.submissionUpdatedAt)}
                                    </div>
                                    <Separator className="my-2" />
                                </div>
                            ))
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
