# 📄 網頁與 API 路徑總覽

## 📄 網頁路徑

### 網址: `/`

-   功能: 首頁，顯示研討會基本資訊、最新公告、重要日期等
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/admin`

-   功能: 管理員主控台，包含公告管理、重要日期管理等功能
-   瀏覽權限: admin

### 網址: `/admin/payments`

-   功能: 付款記錄管理，顯示所有付款記錄並支援綠界 API 查詢
-   瀏覽權限: admin

### 網址: `/admin/stress`

-   功能: 系統壓力測試工具，批量生成審查案用於測試
-   瀏覽權限: admin

### 網址: `/admin/user_management`

-   功能: 使用者管理，包含角色設定、審稿白名單設定、用戶資料查看等
-   瀏覽權限: admin

### 網址: `/conference`

-   功能: 研討會詳細資訊頁面
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/downloads`

-   功能: 檔案下載頁面，提供研討會相關文件下載
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/profile`

-   功能: 個人資料管理、文件上傳、審稿案查看、付款狀態等
-   瀏覽權限: attendee

### 網址: `/reviewer`

-   功能: 審稿者介面，查看分配的審稿案、進行審稿、修改審稿案狀態等
-   瀏覽權限: reviewer

### 網址: `/robot`

-   功能: 田間機器人相關資訊頁面
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/schedule`

-   功能: 大會議程頁面
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/speakers`

-   功能: 專題講者介紹頁面
-   瀏覽權限: attendee, admin, reviewer, public

### 網址: `/travel`

-   功能: 住宿與交通資訊頁面
-   瀏覽權限: attendee, admin, reviewer, public

## 🔌 API 路徑

### 網址: `/api/admin/announcements`

-   功能: 公告管理 (POST: 新增公告, DELETE: 刪除公告)
-   瀏覽權限: admin
-   方法: POST, DELETE

### 網址: `/api/admin/get_all_docs`

-   功能: 取得所有文件清單，供管理員查看
-   瀏覽權限: admin
-   方法: GET

### 網址: `/api/admin/importantDate`

-   功能: 重要日期管理 (POST: 新增重要日期)
-   瀏覽權限: admin
-   方法: POST

### 網址: `/api/admin/set_reviewer_whitelist`

-   功能: 設定審稿者的審稿白名單 (可審稿的發表形式)
-   瀏覽權限: admin
-   方法: POST

### 網址: `/api/admin/set_role`

-   功能: 設定使用者角色 (admin, reviewer, attendee)
-   瀏覽權限: admin
-   方法: POST

### 網址: `/api/admin/user_uploads/[...slug]`

-   功能: 管理員查看使用者上傳的檔案
-   瀏覽權限: admin
-   方法: GET

### 網址: `/api/attendee/remove_document`

-   功能: 移除使用者上傳的文件
-   瀏覽權限: attendee
-   方法: DELETE

### 網址: `/api/attendee/update_pfp`

-   功能: 更新使用者頭像
-   瀏覽權限: attendee
-   方法: POST

### 網址: `/api/attendee/update_profile`

-   功能: 更新使用者個人資料 (姓名、電話、單位、聯絡信箱)
-   瀏覽權限: attendee
-   方法: PUT

### 網址: `/api/attendee/upload_document_and_submit`

-   功能: 上傳文件並自動建立審稿案 (Abstract)
-   瀏覽權限: attendee
-   方法: POST
-   參數: file, pdftype, title, description, topic, presentType

### 網址: `/api/attendee/upload_documents`

-   功能: 上傳文件 (不建立審稿案)
-   瀏覽權限: attendee
-   方法: POST
-   參數: file, pdftype, title, description, topic, presentType

### 網址: `/api/attendee/user_document_index`

-   功能: 取得使用者的文件和審稿案清單
-   瀏覽權限: attendee
-   方法: GET

### 網址: `/api/auth/[...nextauth]`

-   功能: NextAuth.js 驗證端點 (Google OAuth)
-   瀏覽權限: public
-   方法: GET, POST

### 網址: `/api/data/backup`

-   功能: 資料庫備份功能
-   瀏覽權限: admin
-   方法: GET

### 網址: `/api/documents/[pdfId]`

-   功能: 取得特定文件內容，供審稿者和文件擁有者查看
-   瀏覽權限: attendee, reviewer
-   方法: GET

### 網址: `/api/documents/[pdfId]/addnotes`

-   功能: 審稿者為文件新增審稿評論
-   瀏覽權限: reviewer
-   方法: POST
-   參數: note

### 網址: `/api/info/announcement`

-   功能: 取得所有公告資訊，供首頁顯示
-   瀏覽權限: public
-   方法: GET

### 網址: `/api/info/importantDate`

-   功能: 取得所有重要日期，供首頁顯示
-   瀏覽權限: public
-   方法: GET

### 網址: `/api/payment/create-order`

-   功能: 建立綠界付款訂單
-   瀏覽權限: attendee
-   方法: POST
-   參數: paymentType (member/non-member)

### 網址: `/api/payment/get-order-status`

-   功能: 查詢綠界付款狀態
-   瀏覽權限: attendee
-   方法: GET

### 網址: `/api/payment/return`

-   功能: 綠界付款完成後的回調端點
-   瀏覽權限: system
-   方法: POST

### 網址: `/api/reviewer/get_docs_by_status`

-   功能: 審稿者根據狀態取得文件清單
-   瀏覽權限: reviewer
-   方法: GET
-   參數: status

### 網址: `/api/reviewer/get_submissions`

-   功能: 取得審稿者被分配的審稿案清單
-   瀏覽權限: reviewer
-   方法: GET

### 網址: `/api/reviewer/modify_submission_properties`

-   功能: 修改審稿案屬性 (主題、發表形式)
-   瀏覽權限: reviewer
-   方法: PUT
-   參數: submissionId, updates (updatedTopic, updatedPresentType)

### 網址: `/api/reviewer/modify_submission_status`

-   功能: 修改審稿案狀態 (pending, accepted, rejected, replied, waiting)
-   瀏覽權限: reviewer
-   方法: PUT
-   參數: submissionId, updates (submissionType, submissionStatus)

### 網址: `/api/reviewer/upload_modified_document`

-   功能: 審稿者上傳修改後的文件給投稿者
-   瀏覽權限: reviewer
-   方法: POST
-   參數: file, submissionId, note

### 網址: `/api/reviewer/whole_site_stat`

-   功能: 取得整站審稿統計資訊，按主題和狀態分類
-   瀏覽權限: reviewer, admin
-   方法: GET

### 網址: `/api/submissions`

-   功能: 取得使用者的審稿案清單
-   瀏覽權限: attendee
-   方法: GET

### 網址: `/api/user_uploads/[...path]`

-   功能: 存取使用者上傳的檔案
-   瀏覽權限: attendee (限本人), reviewer (限被分配的審稿案)
-   方法: GET

## 📋 主要功能模組

### 🔐 身份驗證系統

-   Google OAuth 登入
-   角色權限管控 (admin, reviewer, attendee)
-   JWT Session 管理

### 📄 文件管理系統

-   PDF/Word 文件上傳
-   文件預覽功能
-   審稿評論系統
-   版本控制

### 🔍 審稿系統

-   審稿案自動分配
-   審稿者白名單管理
-   狀態流程控制 (pending → accepted/rejected/replied → waiting)
-   審稿統計分析

### 💰 付款系統

-   綠界金流整合
-   會員/非會員差別定價
-   付款狀態追蹤

### 📢 內容管理

-   公告發布系統
-   重要日期管理
-   網站靜態內容

### 📊 管理功能

-   使用者管理
-   資料統計分析
-   系統備份
-   壓力測試工具

## 🎯 主要投稿主題分類

-   A. 生物產業機械
-   B. 生物生產工程
-   C. 畜牧自動化與污染防治
-   D. 農業設施與環控工程
-   E. 生物機電控制
-   F. 生醫工程與微奈米機電
-   G. 生物資訊與系統
-   H. 能源與節能技術
-   I. AI 與大數據分析
-   J. 精準農業智動化
-   K. 其他新興科技

## 📝 發表形式

-   **oral**: 口頭發表
-   **poster**: 海報發表
-   **undecided**: 未決定

## 🔄 審稿案狀態流程

1. **pending**: 待審核
2. **accepted**: 接受 (邀請投稿全文)
3. **rejected**: 拒絕
4. **replied**: 退回修改
5. **waiting**: 等待全文投稿
