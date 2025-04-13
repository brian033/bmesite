## 目前的 app/api file structure:

```bash
api
├── admin
│   ├── get_all_docs
│   │   └── route.ts
│   ├── set-role
│   │   └── route.ts
│   └── user_uploads
│       └── [uuid]
│           └── [...path]
│               └── route.ts
├── attendee
│   ├── update_pfp
│   │   └── route.ts
│   ├── update_profile
│   │   └── route.ts
│   ├── upload_documents
│   │   └── route.ts
│   └── user_document_index
│       └── route.ts
├── auth
│   └── [...nextauth]
│       └── route.ts
├── documents
│   └── [pdfId]
│       └── route.ts
├── reviewer
│   └── get_docs_by_status
│       └── route.ts
└── user_uploads
    └── [...path]
        └── route.ts
```

# 📚 API Routes Reference

---

## ✅ /api/auth/[...nextauth]

**Method:** GET / POST  
**權限:** 公開  
**功能:** 使用 NextAuth 進行 Google 登入、callback、session 管理等。

---

## 🧍‍♂️ Attendee Routes

### 📁 /api/attendee/update_profile

**Method:** PUT  
**權限:** 需登入（🛡️ 限使用者本人）  
**功能:** 修改使用者個人資料（name、phone、address、department）

---

### 📁 /api/attendee/update_pfp

**Method:** POST  
**權限:** 需登入（🛡️ 限使用者本人）  
**功能:** 上傳頭像（存至 /uploads/[uuid]/pfp）

---

### 📁 /api/attendee/upload_documents

**Method:** POST  
**權限:** 需登入（🛡️ 限使用者本人）  
**功能:** 上傳 PDF 文件

-   `FormData`: file, pdftype
-   支援 pdftype: abstracts / final_paper / poster / others

---

### 📁 /api/attendee/user_document_index

**Method:** GET  
**權限:** 需登入（🛡️ 限使用者本人）  
**功能:** 回傳使用者上傳的所有文件（按 pdftype 分類）

---

## 📄 /api/documents/[pdfId]

**Method:**

-   GET：取得單一文件詳細資料（🛡️ 限使用者本人 / admin）
-   POST：送出文件審稿（🛡️ 僅限本人，且 status 必須為 "uploaded"）

**權限:** 需登入

---

## 👤 /api/user_uploads/[...path]

**Method:** GET  
**權限:** 需登入（🛡️ 限使用者本人）  
**功能:** 使用者取得自己的檔案（PDF 預覽）

-   e.g., `/api/user_uploads/abstracts/123456.pdf`

---

## 👑 Admin Routes

### 📁 /api/admin/set-role

**Method:** POST  
**權限:** admin  
**功能:** 修改指定 email 的角色

-   body: `{ email, newRole }`

---

### 📁 /api/admin/get_all_docs

**Method:** GET  
**權限:** admin, reviewer（🛡️ 可查看所有使用者文件）  
**功能:** 回傳所有文件（documents collection 全部）

---

### 📁 /api/admin/user_uploads/[uuid]/[...path]

**Method:** GET  
**權限:** admin, reviewer（🛡️ 可讀取任意使用者上傳的檔案）  
**功能:** 查看任意使用者的檔案（供審查使用）

---

## 🕵️ Reviewer Routes

### 📁 /api/reviewer/get_docs_by_status

**Method:** GET  
**權限:** admin, reviewer（🛡️ 可查詢所有文件）  
**功能:** 根據 documentStatus 取回所有文件

-   query param: `?status=pending` / `uploaded` / `approved`
