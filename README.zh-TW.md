# 🎓 全端會議網站

<div align="center">

**📖 Language / 語言選擇**

[![English](https://img.shields.io/badge/🇺🇸_English-README.md-red?style=for-the-badge)](README.md) [![繁體中文](https://img.shields.io/badge/🇹🇼_繁體中文-README.zh--TW.md-blue?style=for-the-badge)](README.zh-TW.md)

</div>

> 為 2025 年生機與農機學術研討會打造的綜合會議管理平台

[![Live Demo](https://img.shields.io/badge/Live%20Demo-beame2025.cc-green?style=for-the-badge)](https://beame2025.cc/)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-5.9-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## ✨ 專案概述

這是一個專為 **2025 年生機與農機學術研討會** (2025 Conference on Biomechatronics Engineering and Agricultural Machinery) 開發的精緻**全端會議管理平台**。目前部署於 **[beame2025.cc](https://beame2025.cc/)**。

### 🎯 完整會議生命週期管理

這個**全套解決方案**處理會議管理的各個層面：

```
📢 公告發布 → 👤 用戶註冊 → 💳 繳費處理 → 📄 文件投稿 →
🔍 審稿流程 → ✅ 審稿結果 → 📱 QR 簽到 → 🎉 活動完成
```

**📋 完整業務流程覆蓋：**

- **📢 資訊發布**：動態公告、重要日期、講者資訊，搭配**即時管理面板編輯功能** - 主辦方可直接從前端管理所有內容，無需後台存取權限。**這是專為非技術背景的活動主辦方設計的解決方案。**
- **👥 用戶註冊**：Google OAuth 認證搭配多角色管理
- **💳 繳費處理**：ECPay 綠界支付自動整合，支援時段式定價（早鳥、一般、現場價）
- **📄 文件提交**：PDF/Word 上傳，提供即時預覽和驗證
- **🔍 文件審稿系統**：兩階段審稿工作流程（摘要 → 全文）及修改循環
- **📧 通訊中樞**：每個工作流程轉換都有自動郵件通知
- **📱 活動管理**：基於 QR code 的簽到系統，用於現場出席追蹤
- **📊 行政控制**：全面的管理控制台，涵蓋用戶、繳費、投稿管理

## 🎨 平台截圖

### 🏠 公開介面

![首頁](./docs/screenshots/homepage.png)

_動態首頁包含會議資訊、公告及講者詳細資料_

### 👤 用戶儀表板

![用戶資料](./docs/screenshots/user-dashboard.png)

_個人儀表板提供文件投稿、繳費狀態、審稿追蹤功能_

### 🔍 審稿系統

![審稿者儀表板](./docs/screenshots/reviewer-dashboard.png)

_全方位審稿者介面，具備文件預覽和批次操作功能_

### ⚙️ 管理面板

![管理儀表板](./docs/screenshots/admin-dashboard.png)

_非技術人員友善的管理面板，用於內容管理、用戶角色、系統配置_

> **備註**：截圖展示目前正在為 [beame2025.cc](https://beame2025.cc/) 服務的實際系統

## 🚀 核心技術成就

- **多角色認證系統**，具備細緻權限控制
- **複雜文件審稿工作流程**，包含狀態管理
- **第三方付款整合** (ECPay) 搭配動態定價
- **即時 QR Code 簽到系統**，用於活動管理
- **自動化郵件通知系統**，具備客製化範本
- **PDF 文件處理與預覽**功能
- **RESTful API 設計**，包含 30+ 端點和自訂中介軟體

## 🏗️ 系統架構

### 技術堆疊

```
前端:    Next.js 15 + React 19 + TypeScript + Tailwind CSS
後端:     Next.js API Routes + 自訂中介軟體工廠
資料庫:   MongoDB 搭配複雜關聯資料結構
認證:     NextAuth.js + Google OAuth 2.0
付款:     ECPay (台灣金流閘道)
UI/UX:   Radix UI + shadcn/ui + 自訂元件
DevOps:  Docker + Docker Compose + CloudFlare Tunnel
郵件:     Nodemailer + HTML 範本
PDF:     PDF.js + Mammoth.js
```

### 核心元件架構

```mermaid
graph TB
    subgraph "前端層 (Next.js)"
        A1[🌐 公開頁面<br/>會議資訊、公告]
        A2[👤 個人儀表板<br/>投稿、付款狀態]
        A3[⚙️ 管理/審稿儀表板<br/>系統管理、審稿]
    end

    subgraph "API 層 (30+ 路由)"
        B1[🔐 認證 API<br/>NextAuth/Google OAuth]
        B2[📄 文件 API<br/>上傳/審稿/下載]
        B3[💳 付款 API<br/>ECPay 綠界金流]
        B4[📧 通知 API<br/>郵件系統]
        B5[👥 用戶 API<br/>角色管理]
    end

    subgraph "資料層與外部服務"
        C1[(🗄️ MongoDB<br/>文件、用戶、付款)]
        C2[📁 檔案系統<br/>文件上傳儲存]
        C3[📬 郵件服務<br/>Nodemailer]
        C4[🏦 ECPay<br/>金流服務]
    end

    style A1 fill:#1976d2,color:#fff
    style A2 fill:#388e3c,color:#fff
    style A3 fill:#f57c00,color:#fff
    style C1 fill:#7b1fa2,color:#fff
    style C2 fill:#d32f2f,color:#fff
    style C3 fill:#2e7d32,color:#fff
    style C4 fill:#f57c00,color:#fff
```

## 🎯 核心功能

### 👥 多角色權限系統

- **參會者**：註冊、文件投稿、付款
- **審稿者**：論文審查、狀態管理、批次操作
- **管理者**：用戶管理、系統配置、數據分析
- **工作人員**：簽到協助、手動操作

### 📄 文件管理與審稿工作流程

```mermaid
flowchart TD
    A[📤 用戶提交文件] --> B[⏳ 待審核]
    B --> C[🔍 審核中]

    C --> D{📋 審稿者決定}

    D -->|✅ 接受| E[✨ 摘要通過]
    D -->|❌ 拒絕| F[🚫 已拒絕 - 結案]
    D -->|📝 需要修改| G[↩️ 回覆 - 需要更改]

    G --> H[✏️ 用戶修改摘要<br/>📝 審稿者提供評論<br/>📎 審稿者可上傳修改檔案]
    H --> I[⏳ 等待審核]
    I --> C

    E --> J[📄 全文投稿]
    J --> K[⏳ 全文審核中]
    K --> L{📋 全文審查}

    L -->|✅ 接受| M[🎉 全文通過]
    L -->|❌ 拒絕| N[🚫 全文被拒]
    L -->|📝 需要修改| O[↩️ 全文需要更改]

    O --> P[✏️ 用戶修改全文<br/>📝 審稿者提供評論<br/>📎 審稿者可上傳修改檔案]
    P --> Q[⏳ 全文等待審核]
    Q --> L

    M --> R[🏁 會議準備就緒]
    N --> S[🏁 最終 - 未獲接受]

    style A fill:#1976d2,color:#fff
    style E fill:#388e3c,color:#fff
    style F fill:#d32f2f,color:#fff
    style G fill:#f57c00,color:#fff
    style M fill:#2e7d32,color:#fff
    style N fill:#c62828,color:#fff
    style O fill:#f57c00,color:#fff
    style R fill:#2e7d32,color:#fff
    style S fill:#c62828,color:#fff
```

**核心功能特色：**

- **自動化郵件通知** 📧 在每次狀態轉換時發送
- **兩階段審稿流程**：摘要 → 全文審查
- **修改循環**：兩個階段都支援多次修改提交
- **互動式審稿系統**：審稿者可提供書面評論並上傳修改後的文件
- **PDF/Word 文件上傳**，具備驗證和預覽功能
- **審稿者儀表板整合**，提供即時狀態更新
- **審稿者白名單系統**，用於定向分派
- **狀態追蹤**，為所有利害關係人提供即時通知

### 💳 動態付款系統

- **時段式定價**：早鳥 → 一般 → 現場價格
- **類別式定價**：會員、非會員、學生價格
- **ECPay 整合**，具備自動狀態驗證
- **手動付款處理**，供管理用戶使用

### 📧 智能通知系統

- 基於範本的郵件系統，支援動態內容
- 事件驅動通知（付款確認、狀態更新）

## 🛠️ API 架構亮點

### 自訂中介軟體工廠

實作可重複使用的中介軟體系統，確保 API 行為一致：

```typescript
middlewareFactory(
  {
    cors: true,
    auth: true,
    role: ["admin", "reviewer"],
  },
  handler
);
```

### 路由組織 (30+ 端點)

```
/api/
├── auth/              # 認證 (NextAuth)
├── attendee/          # 用戶特定操作
├── admin/             # 管理功能
├── reviewer/          # 審稿系統
├── payment/           # 付款處理
├── documents/         # 檔案管理
├── info/              # 公開資訊
└── helpers/           # 實用功能
```

### 核心技術實作

- **型別安全的 API 回應**，搭配 TypeScript 介面
- **全方位錯誤處理**，具備標準化回應
- **基於會話的授權**，搭配角色存取控制
- **CORS 處理**，確保安全的跨來源請求

## 📊 資料模型

### 核心集合

- **用戶**：個人資料、角色、付款狀態
- **文件**：檔案元資料、審稿狀態、註釋
- **投稿**：審稿工作流程追蹤
- **付款**：ECPay 整合的交易紀錄
- **公告**：動態內容管理
- **付款選項**：時段式定價配置

## 🚀 快速部署

### 系統需求

- Docker & Docker Compose
- Google OAuth 憑證
- ECPay 商家帳號（付款功能可選）
- SMTP 郵件服務憑證

### 簡易設置

```bash
# 1. 下載專案
git clone https://github.com/brian033/bmesite
cd bime_conf

# 2. 建立必要目錄
mkdir uploads db

# 3. 設定環境變數
cp env_example.txt .env
# 填入您的設定值

# 4. 啟動應用程式
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d
```

### 資料庫初始化

系統在 `basic_datas/` 中包含預先設定的資料：

- **付款選項**，具備時段式定價
- **系統公告**和重要日期
- **預設設定**，可立即部署

匯入初始資料：

```bash
# 匯入付款選項
docker exec mongo mongoimport --db confDb --collection paymentOptions --file /app/basic_datas/confDb.paymentOptions.json

# 匯入公告
docker exec mongo mongoimport --db confDb --collection announcements --file /app/basic_datas/confDb.announcements.json

# 匯入重要日期
docker exec mongo mongoimport --db confDb --collection importantDates --file /app/basic_datas/confDb.importantDates.json
```

或使用 MongoDB Compass 以互動式 UI 載入資料

### 自動化備份與恢復系統

平台在 `scripts/` 目錄中包含完整的備份腳本：

**備份系統** (`./scripts/backup.sh`)：

- **資料庫備份**：使用 `mongodump` 建立完整的 MongoDB 快照
- **檔案系統備份**：將所有上傳文件壓縮為帶時間戳的 ZIP 檔案
- **自動組織**：建立帶時間戳的備份目錄，便於管理
- **Docker 整合**：與容器化的 MongoDB 實例無縫協作

**恢復系統** (`./scripts/restore.sh`)：

- **完整恢復**：從備份中恢復資料庫和檔案上傳
- **資料驗證**：自動定位備份檔案並驗證完整性
- **清除重建**：使用 `--drop` 標誌確保乾淨的恢復

**正式環境功能**：

```bash
# 透過 cron job 每日自動備份
0 2 * * * /path/to/scripts/backup.sh $MONGO_PASSWORD >> /var/log/conference-backup.log 2>&1

# 需要時快速恢復
./scripts/restore.sh $MONGO_PASSWORD ./backup/2025-08-28_02-00-00
```

此備份系統**確保零資料遺失**，並為關鍵會議操作提供快速災難恢復。

## 🌟 開發亮點

### 問題解決方法

- **複雜狀態管理**：為文件工作流程狀態實作自訂 hooks
- **付款安全性**：實作 ECPay 雜湊驗證和 webhook 處理
- **UI/UX 一致性**：使用 Radix UI 建立可重複使用的元件庫

### 效能最佳化

- **伺服器端渲染**，搭配 Next.js 達到最佳 SEO
- **圖片最佳化**，使用 Next.js 內建功能
- **資料庫索引**，提供高效查詢效能
- **容器化部署**，確保一致的環境
- **Cloudflare tunnel 支援**，無需配置防火牆設定

## 📈 商業影響

- 目前為 **2025 年生機與農機學術研討會** 提供服務
- 處理 **100+ 用戶註冊**和文件投稿
- 透過自動化付款系統處理**會議費用**
- 透過工作流程自動化減少行政工作負擔

## 👨‍💻 開發者資訊

**專案背景**：此應用程式在 **1.5 個月內從零開始到正式部署上線**，專為 2025 年生機與農機學術研討會 (2025 Conference on Biomechatronics Engineering and Agricultural Machinery) 開發。**前期開發由 @brian033 獨立完成**，涵蓋全端架構、核心業務邏輯和系統整合。由於會議期間正值實習期間，**@dn070017 在前端改善和營運維護方面貢獻良多**。

**核心學習成果**：

- 進階 Next.js 15 功能和最佳化
- React 應用程式的複雜狀態管理
- 文件工作流程系統的資料庫設計
- 第三方 API 整合（付款閘道、OAuth）
- Docker 容器化和部署策略

**致謝**：

- 特別感謝**國立台灣大學生物機電工程學系**的教授們信任一位大學生承擔這項重要專案責任
- 深深感謝 **@dn070017** 傑出的專案領導 - 從早期階段提供清晰的規格和需求，作為與會議籌辦教師的介面來管理專案範圍和可行性，在挑戰性開發階段提供實際的技術指導，並在我因實習無法維護時直接貢獻程式碼改進

**線上展示**：造訪 [beame2025.cc](https://beame2025.cc/) 查看平台實際運作。
_(備註：線上展示可能在 2025 年 9 月會議結束後停止服務)_

## 🚀 未來藍圖與雲端遷移

### 📈 可擴展性增強計畫

目前部署為具備本機儲存的**單體應用程式**。遷移計畫專注於實際的可擴展性改進：

#### 階段 1：雲端儲存遷移

- **本機檔案系統 → AWS S3**：將文件上傳遷移至可擴展的雲端儲存
- **效益**：無限儲存空間、自動備份、CDN 整合以加快檔案存取速度

#### 階段 2：資料庫遷移

- **自架 MongoDB → MongoDB Atlas**：遷移至託管的雲端資料庫
- **效益**：自動擴展、內建安全性、專業維護

#### 階段 3：容器化部署

- **Docker Compose → EKS 服務**：將整個 Next.js 應用程式（前端 + 後端）包裝為單一 EKS pod
- **負載平衡器**：新增應用程式負載平衡器進行流量分散
- **自動擴展**：根據流量需求配置 pod 擴展
- **效益**：零停機部署、自動擴展、提升可靠性

### 🎯 預期改進

- **水平擴展**：處理增加的會議參與者負載
- **99.9% 正常運行時間**：為關鍵會議期間提供專業級可用性
- **全球效能**：透過 CDN 提供更快的檔案存取
- **簡化維護**：託管服務減少營運開銷
