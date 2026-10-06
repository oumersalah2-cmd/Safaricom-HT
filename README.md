# Ethio Bucks (ኢትዮ ባክስ)
> **Micro-Task & Gig Economy Marketplace on Safaricom M-Pesa (Ethiopia)**  
> Full-Stack Platform: **React Frontend + Node.js Express Backend**

---

## 🌟 Platform Overview
**Ethio Bucks** connects Ethiopian businesses with nationwide mobile smartphone workers:
- **Merchants / Businesses**: Post micro-tasks (app testing, Google reviews, surveys, local price collection), fund escrow pools via **Safaricom M-Pesa STK Push**, and verify proof with automated AI screening.
- **Workers**: Browse paid micro-tasks, submit genuine photo proof, earn Ethiopian Birr (ETB) guaranteed in escrow, and withdraw instantly to their mobile phone via **Safaricom Daraja B2C Payout**.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│      (Vite + Lucide Icons + Multilingual i18n)         │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (/api/*)
┌───────────────────────────▼────────────────────────────┐
│                  Node.js Express Backend               │
│                 (server/index.js :5000)                │
├─────────────────┬───────────────────┬──────────────────┤
│ Auth & OTP      │ Tasks & Escrow    │ M-Pesa Daraja    │
│ (Safaricom SMS) │ (AI Verification) │ (STK & B2C API)  │
└─────────────────┴─────────┬─────────┴──────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            Persistent JSON Database Engine             │
│                 (server/data/database.json)            │
└────────────────────────────────────────────────────────┘
```

### 1. Backend (`server/`)
- **Runtime**: Node.js v24 (ES Modules)
- **Framework**: Express 5 + CORS + Dotenv
- **Database**: Persistent JSON Storage Engine with atomic file write protections (`server/services/db.js`)
- **Services**:
  - `mpesaService.js`: Safaricom Daraja STK Push deposits, B2C cash-out payouts, webhook callbacks, transaction ledger.
  - `aiService.js`: Perceptual image hashing (`pHash`), duplicate submission detection, OCR text extraction simulation.
  - `smsService.js`: Official Safaricom M-PESA SMS dispatcher and inbox storage.

### 2. Frontend (`src/`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailored Modern Vanilla CSS (Sleek dark theme, glassmorphism, responsive grid)
- **API Client**: `src/services/api.js` (Proxy configured at `/api` -> `http://localhost:5000`)
- **Languages Supported**: English (EN), አማርኛ (Amharic), Afaan Oromoo (OM)

---

## 🚀 Key Platform Features

### 🔐 1. Strict Phone OTP Authentication
- Verified using real **Safaricom Ethiopia mobile numbers** (`07XX XXX XXX`).
- Dispatches 6-digit verification code with official SMS delivery.
- One-click demo sign-in buttons for instant profile testing:
  - **Worker:** Kidus Girma (185.00 ETB Balance, Silver Tier)
  - **Merchant:** Tomoca Coffee Roasters (Till 789201, 3,500 ETB Escrow)

### 📋 2. Worker Portal
- **Browse Micro-Tasks**: Filter by category, search queries, minimum trust tier, and reward size.
- **Task Execution Modal**: Verification guidelines, target link, anti-bot action countdown timer with demo skip button.
- **Genuine Image Upload**: Drag & drop or browse device screenshot, with live AI match score & duplicate signature checks.
- **My Submissions Tracker**: Live status pipeline (Pending Review ⏳, Approved & Paid ✅, Rejected ❌ with feedback).
- **Wallet & Cash-Out**: Real-time available balance, pending escrow count, and instant Safaricom B2C payout modal.
- **Referral Rewards**: Unique referral code, friends activity tracker, and 15 ETB bonus releases.

### 🏢 3. Merchant / Business Portal
- **Active Campaigns Overview**: Total slots, completion progress, and escrow funds.
- **Create Campaign & STK Push**: Calculates worker pool + 15% platform fee, triggering Safaricom STK Push to Till shortcode.
- **Verification Queue**: Review submitted screenshots with AI confidence scores, OCR text read, and duplicate alerts.
- **1-Click Settlement**: Approve to instantly release escrow to worker wallet, or reject with explanatory feedback.
- **Analytics & ROI**: Cost comparison vs traditional marketing agencies (80%+ cost savings).

### 📱 4. Safaricom M-Pesa Phone & SMS Inbox
- Interactive on-screen Safaricom smartphone:
  - Live USSD / SIM Toolkit STK Push prompts with PIN authorization.
  - Official Safaricom M-PESA SMS Inbox receiving real OTP codes, deposit receipts, approval alerts, and B2C cash-outs.

---

## 🛠️ API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Dispatch 6-digit verification code to Safaricom phone |
| `POST` | `/api/auth/verify-otp` | Verify OTP code and issue session token |
| `GET` | `/api/auth/me` | Get authenticated user profile, wallet & unread SMS |
| `GET` | `/api/tasks` | List micro-tasks with category & tier filters |
| `POST` | `/api/tasks` | Business funds and creates campaign via STK Push |
| `GET` | `/api/submissions` | Get worker submissions or business review queue |
| `POST` | `/api/submissions` | Worker uploads screenshot proof of work |
| `POST` | `/api/submissions/:id/approve` | Business approves submission and releases escrow |
| `POST` | `/api/submissions/:id/reject` | Business rejects submission with reason |
| `GET` | `/api/wallet` | Get balance, escrow pool, and B2C payout receipts |
| `POST` | `/api/wallet/withdraw` | Worker cash-out disbursed via Safaricom B2C API |
| `GET` | `/api/mpesa/logs` | Real-time Daraja STK Push and B2C transaction logs |
| `GET` | `/api/mpesa/sms` | Safaricom M-Pesa SMS inbox for user phone |
| `GET` | `/api/analytics` | Platform metrics, fraud blocks, and SME savings |

---

## 💻 Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full Platform (Backend + Frontend)
```bash
npm run dev
```
- **Backend API**: Running at `http://localhost:5000/api`
- **Frontend App**: Running at `http://localhost:5173/`

### 3. Or Run Independently
```bash
# Start Node.js API server only
npm run server

# Start Vite React frontend only
npm run client
```

### 4. Build for Production
```bash
npm run build
```
