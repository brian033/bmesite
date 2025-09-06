# 🎓 Full-Stack Conference Site

<div align="center">

**📖 Language / 語言選擇**

[![English](https://img.shields.io/badge/🇺🇸_English-README.md-red?style=for-the-badge)](README.md) [![繁體中文](https://img.shields.io/badge/🇹🇼_繁體中文-README.zh--TW.md-blue?style=for-the-badge)](README.zh-TW.md)

</div>

> A comprehensive conference management platform for the 2025 Conference on Biomechatronics Engineering and Agricultural Machinery

[![Live Demo](https://img.shields.io/badge/Live%20Demo-beame2025.cc-green?style=for-the-badge)](https://beame2025.cc/)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-5.9-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## ✨ Project Overview

This is a sophisticated **full-stack conference management platform** specifically developed for the **2025 Conference on Biomechatronics Engineering and Agricultural Machinery** (2025 年生機與農機學術研討會). Currently deployed at **[beame2025.cc](https://beame2025.cc/)**.

### 🎯 Complete Conference Lifecycle Management

This **end-to-end full-stack solution** handles every aspect of conference management:

```
📢 Announcements → 👤 Registration → 💳 Payment → 📄 Submission →
🔍 Review Process → ✅ Acceptance → 📱 QR Check-in → 🎉 Event Completion
```

**📋 Full Business Process Coverage:**

- **📢 Information Publishing**: Dynamic announcements, important dates, speaker information with **real-time admin panel editing** - organizers can manage all content directly from the frontend without backend access. **This is a solution designed for non-technical event organizers.**
- **👥 User Registration**: Google OAuth authentication with multi-role management
- **💳 Payment Processing**: Automated ECPay integration with time-based pricing (early bird, regular, on-site)
- **📄 Document Submission**: PDF/Word upload with real-time preview and validation
- **🔍 Document Review System**: Two-stage review workflow (abstract → full paper) with revision cycles
- **📧 Communication Hub**: Automated email notifications for every workflow transition
- **📱 Event Management**: QR code-based check-in system for on-site attendance tracking
- **📊 Administrative Control**: Comprehensive admin dashboard for user, payment, and submission management

## 🎨 Platform Screenshots

### 🏠 Public Interface

![Homepage](./docs/screenshots/homepage.png)
_Dynamic homepage with conference information, announcements, and speaker details_

### 👤 User Dashboard

![User Profile](./docs/screenshots/user-dashboard.png)
_Personal dashboard for document submission, payment status, and review tracking_

### 🔍 Review System

![Reviewer Dashboard](./docs/screenshots/reviewer-dashboard.png)
_Comprehensive reviewer interface with document preview and batch operations_

### ⚙️ Admin Panel

![Admin Dashboard](./docs/screenshots/admin-dashboard.png)
_Non-technical admin panel for content management, user roles, and system configuration_

> **Note**: Screenshots showcase the live system currently serving [beame2025.cc](https://beame2025.cc/)

## 🚀 Key Technical Achievements

- **Multi-role Authentication System** with granular permissions
- **Complex Document Review Workflow** with status management
- **Third-party Payment Integration** (ECPay) with dynamic pricing
- **Real-time QR Code Check-in System** for event management
- **Automated Email Notification System** with custom templates
- **PDF Document Processing & Preview** capabilities
- **RESTful API Design** with 30+ endpoints and custom middleware

## 🏗️ System Architecture

### Tech Stack

```
Frontend:    Next.js 15 + React 19 + TypeScript + Tailwind CSS
Backend:     Next.js API Routes + Custom Middleware Factory
Database:    MongoDB with complex relational data schema
Auth:        NextAuth.js + Google OAuth 2.0
Payment:     ECPay (Taiwan payment gateway)
UI/UX:       Radix UI + shadcn/ui + Custom Components
DevOps:      Docker + Docker Compose + CloudFlare Tunnel
Email:       Nodemailer + HTML Templates
PDF:         PDF.js + Mammoth.js
```

### Core Components Architecture

```mermaid
graph TB
    subgraph "Frontend Layer (Next.js)"
        A1[🌐 Public Pages<br/>Conference Info & Announcements]
        A2[👤 Profile Dashboard<br/>Submission & Payment Status]
        A3[⚙️ Admin/Reviewer Dashboard<br/>System Management & Review]
    end

    subgraph "API Layer (30+ Routes)"
        B1[🔐 Auth API<br/>NextAuth/Google OAuth]
        B2[📄 Document API<br/>Upload/Review/Download]
        B3[💳 Payment API<br/>ECPay Integration]
        B4[📧 Notification API<br/>Email System]
        B5[👥 User API<br/>Role Management]
    end

    subgraph "Data Layer & External Services"
        C1[(🗄️ MongoDB<br/>Documents, Users, Payments)]
        C2[📁 File System<br/>Document Upload Storage]
        C3[📬 Email Service<br/>Nodemailer]
        C4[🏦 ECPay<br/>Payment Gateway]
    end

    style A1 fill:#1976d2,color:#fff
    style A2 fill:#388e3c,color:#fff
    style A3 fill:#f57c00,color:#fff
    style C1 fill:#7b1fa2,color:#fff
    style C2 fill:#d32f2f,color:#fff
    style C3 fill:#2e7d32,color:#fff
    style C4 fill:#f57c00,color:#fff
```

## 🎯 Core Features

### 👥 Multi-Role Permission System

- **Attendees**: Registration, document submission, payment
- **Reviewers**: Paper review, status management, batch operations
- **Admins**: User management, system configuration, analytics
- **Helpers**: Check-in assistance, manual operations

### 📄 Document Management & Review Workflow

```mermaid
flowchart TD
    A[📤 User Submits Document] --> B[⏳ Pending Review]
    B --> C[🔍 Under Review]

    C --> D{📋 Reviewer Decision}

    D -->|✅ Accept| E[✨ Abstract Accepted]
    D -->|❌ Reject| F[🚫 Rejected - Final]
    D -->|📝 Needs Revision| G[↩️ Replied - Needs Changes]

    G --> H[✏️ User Revises Abstract<br/>📝 Reviewer provides comments<br/>📎 Reviewer can upload modified file]
    H --> I[⏳ Waiting Review]
    I --> C

    E --> J[📄 Full Paper Submission]
    J --> K[⏳ Full Paper Under Review]
    K --> L{📋 Full Paper Review}

    L -->|✅ Accept| M[🎉 Final Paper Accepted]
    L -->|❌ Reject| N[🚫 Final Paper Rejected]
    L -->|📝 Needs Revision| O[↩️ Final Paper Needs Changes]

    O --> P[✏️ User Revises Final Paper<br/>📝 Reviewer provides comments<br/>📎 Reviewer can upload modified files]
    P --> Q[⏳ Final Paper Waiting Review]
    Q --> L

    M --> R[🏁 Conference Ready]
    N --> S[🏁 Final - Not Accepted]

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

**Key Features:**

- **Automated Email Notifications** 📧 sent at every state transition
- **Two-Stage Review Process**: Abstract → Full Paper review
- **Revision Loops**: Both stages support multiple revision cycles
- **Interactive Review System**: Reviewers can provide written comments and upload modified documents
- **PDF/Word document upload** with validation and preview
- **Reviewer Dashboard Integration** with real-time status updates
- **Reviewer Whitelist System** for targeted assignment
- **Status Tracking** with instant notifications to all stakeholders

### 💳 Dynamic Payment System

- **Time-based pricing**: Early bird → Regular → On-site rates
- **Category-based pricing**: Member, Non-member, Student rates
- **ECPay integration** with automatic status verification
- **Manual payment processing** for admin users

### 📧 Smart Notification System

- Template-based email system with dynamic content
- Event-driven notifications (payment confirmation, status updates)

## 🛠️ API Architecture Highlights

### Custom Middleware Factory

Implemented a reusable middleware system for consistent API behavior:

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

### Route Organization (30+ endpoints)

```
/api/
├── auth/              # Authentication (NextAuth)
├── attendee/          # User-specific operations
├── admin/             # Administrative functions
├── reviewer/          # Review system
├── payment/           # Payment processing
├── documents/         # File management
├── info/              # Public information
└── helpers/           # Utility functions
```

### Key Technical Implementations

- **Type-safe API responses** with TypeScript interfaces
- **Comprehensive error handling** with standardized responses
- **Session-based authorization** with role-based access control
- **CORS handling** for secure cross-origin requests

## 📊 Data Models

### Core Collections

- **Users**: Profile data, roles, payment status
- **Documents**: File metadata, review status, annotations
- **Submissions**: Review workflow tracking
- **Payments**: Transaction records with ECPay integration
- **Announcements**: Dynamic content management
- **PaymentOptions**: Time-based pricing configuration

## 🚀 Quick Deployment

### Prerequisites

- Docker & Docker Compose
- Google OAuth credentials
- ECPay merchant account (optional for payments)
- SMTP email service credentials

### Easy Setup

```bash
# 1. Clone the repository
git clone https://github.com/brian033/bmesite
cd bime_conf

# 2. Populate required directories
mkdir uploads db

# 3. Configure environment variables
cp env_example.txt .env
# Fill in your configuration values

# 4. Start the application
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d
```

### Database Initialization

The system includes pre-configured data in `basic_datas/`:

- **Payment options** with time-based pricing
- **System announcements** and important dates
- **Default configuration** for immediate deployment

Import initial data:

```bash
# Import payment options
docker exec mongo mongoimport --db confDb --collection paymentOptions --file /app/basic_datas/confDb.paymentOptions.json

# Import announcements
docker exec mongo mongoimport --db confDb --collection announcements --file /app/basic_datas/confDb.announcements.json

# Import important dates
docker exec mongo mongoimport --db confDb --collection importantDates --file /app/basic_datas/confDb.importantDates.json
```

Or use MongoDB Compass to load data with interactive ui

### Automated Backup & Recovery System

The platform includes comprehensive backup scripts in `scripts/` directory:

**Backup System** (`./scripts/backup.sh`):

- **Database Backup**: Uses `mongodump` to create complete MongoDB snapshots
- **File System Backup**: Compresses all uploaded documents into timestamped ZIP files
- **Automated Organization**: Creates timestamped backup directories for easy management
- **Docker Integration**: Works seamlessly with containerized MongoDB instance

**Recovery System** (`./scripts/restore.sh`):

- **Complete Restoration**: Restores both database and file uploads from backup
- **Data Validation**: Automatically locates backup files and validates integrity
- **Drop & Replace**: Uses `--drop` flag to ensure clean restoration

**Production-Ready Features**:

```bash
# Daily automated backup via cron job
0 2 * * * /path/to/scripts/backup.sh $MONGO_PASSWORD >> /var/log/conference-backup.log 2>&1

# Quick restore when needed
./scripts/restore.sh $MONGO_PASSWORD ./backup/2025-08-28_02-00-00
```

This backup system **ensures zero data loss** and enables rapid disaster recovery for critical conference operations.

## 🌟 Development Highlights

### Problem-Solving Approach

- **Complex State Management**: Implemented custom hooks for document workflow states
- **Payment Security**: Implemented ECPay hash verification and webhook handling
- **UI/UX Consistency**: Created reusable component library with Radix UI

### Performance Optimizations

- **Server-side Rendering** with Next.js for optimal SEO
- **Image Optimization** with Next.js built-in features
- **Database Indexing** for efficient query performance
- **Containerized Deployment** for consistent environments
- **Cloudflare tunnel support** no need to configure Firewall settings

## 📈 Business Impact

- Currently serving the **2025 Conference on Biomechatronics Engineering and Agricultural Machinery**
- Handling **100+ user registrations** and document submissions
- Processing **conference fees** through automated payment system
- Reducing administrative workload through workflow automation

## 👨‍💻 Developer Information

**Project Background**: This application was developed **from scratch to production deployment within 1.5 months** for the 2025 年生機與農機學術研討會 (2025 Conference on Biomechatronics Engineering and Agricultural Machinery). **Early development was completed independently by @brian033**, covering the full-stack architecture, core business logic, and system integration. Due to internship commitments during the conference period, **@dn070017 contributed significantly to frontend refinements and operational maintenance** during the live event phase.

**Key Learning Outcomes**:

- Advanced Next.js 15 features and optimizations
- Complex state management in React applications
- Database design for document workflow systems
- Third-party API integration (Payment gateways, OAuth)
- Docker containerization and deployment strategies

**Acknowledgments**:

- Special gratitude to the **Department of Biomechatronics Engineering, National Taiwan University** professors for trusting an undergraduate student with this critical project responsibility
- Deep appreciation to **@dn070017** for exceptional project leadership - providing clear specifications and requirements from the early stages, serving as an interface with conference organizing faculty to manage scope and feasibility, offering practical technical guidance during challenging development phases, and directly contributing code improvements during conference operations when I was unavailable due to internship commitments

**Live Demo**: Visit [beame2025.cc](https://beame2025.cc/) to see the platform in action.
_(Note: Live demo may be discontinued after the conference concludes in September 2025)_

## 🚀 Future Roadmap & Cloud Migration

### 📈 Scalability Enhancement Plan

Currently deployed as a **monolithic application** with local storage. The migration plan focuses on practical scalability improvements:

#### Phase 1: Cloud Storage Migration

- **Local File System → AWS S3**: Migrate document uploads to scalable cloud storage
- **Benefits**: Unlimited storage, automatic backups, CDN integration for faster file access

#### Phase 2: Database Migration

- **Self-hosted MongoDB → MongoDB Atlas**: Move to managed cloud database
- **Benefits**: Automatic scaling, built-in security, professional maintenance

#### Phase 3: Containerized Deployment

- **Docker Compose → EKS Service**: Package the entire Next.js application (frontend + backend) as a single EKS pod
- **Load Balancer**: Add Application Load Balancer for traffic distribution
- **Auto-scaling**: Configure pod scaling based on traffic demands
- **Benefits**: Zero-downtime deployments, automatic scaling, improved reliability

### 🎯 Expected Improvements

- **Horizontal Scaling**: Handle increased conference attendee loads
- **99.9% Uptime**: Professional-grade availability for critical conference periods
- **Global Performance**: Faster file access through CDN
- **Simplified Maintenance**: Managed services reduce operational overhead
