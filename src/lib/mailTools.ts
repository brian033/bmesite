import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import clientPromise from "./mongodb";
// 郵件傳輸器配置
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail 應用程式密碼
    },
    secure: true, // 使用 SSL
    port: 465,
    host: "smtp.gmail.com",
});

interface EmailAttachment {
    filename: string;
    path: string;
    contentType?: string;
}

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: EmailAttachment[];
    replyTo?: string;
}

/**
 * 發送電子郵件
 * @param options 電子郵件選項
 * @returns 發送結果
 */
export async function sendEmail(options: SendEmailOptions) {
    try {
        const { to, subject, text, html, cc, bcc, attachments, replyTo } = options;

        // 準備發送選項
        const mailOptions = {
            from: `${process.env.EMAIL_SENDER_NAME || "生機農機學術研討會"} <${
                process.env.EMAIL_USER
            }>`,
            to,
            cc,
            bcc,
            replyTo: replyTo || process.env.EMAIL_USER,
            subject,
            text,
            html,
            attachments,
        };

        // 發送郵件
        const info = await transporter.sendMail(mailOptions);
        console.log("郵件發送成功:", info.messageId);
        // 儲存郵件到 MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection("emails");
        await collection.insertOne({
            status: "sent",
            data: mailOptions,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("郵件發送失敗:", error);
        return { success: false, error };
    }
}

/**
 * 從模板發送電子郵件
 * @param templateName 模板名稱 (templates 目錄下的檔案名，不包含副檔名)
 * @param data 要插入模板的資料
 * @param options 電子郵件選項
 * @returns 發送結果
 */
export async function sendTemplateEmail(
    templateName: string,
    data: Record<string, any>,
    options: Omit<SendEmailOptions, "html">
) {
    try {
        // 讀取模板文件
        const templatePath = path.join(
            process.cwd(),
            "src",
            "mailTemplates",
            `${templateName}.html`
        );
        let template = await fs.readFile(templatePath, "utf8");

        // 替換模板中的變數
        Object.entries(data).forEach(([key, value]) => {
            template = template.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        });

        // 發送郵件
        return sendEmail({
            ...options,
            html: template,
        });
    } catch (error) {
        console.error(`模板郵件 ${templateName} 發送失敗:`, error);
        return { success: false, error };
    }
}

/**
 * 發送系統通知
 * @param subject 主旨
 * @param content 內容
 * @returns 發送結果
 */
export async function sendSystemNotification(subject: string, content: string) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    return sendEmail({
        to: adminEmail,
        subject: `[系統通知] ${subject}`,
        text: content,
    });
}
