# Ethio Bucks (ኢትዮ ባክስ)
> **Micro-Task Marketplace on Safaricom M-Pesa (Ethiopia)**  
> **Team:** Code Titans | **Safaricom Hackathon 2026**

---

## 🌟 One-Line Pitch
A micro-task marketplace powered by mobile money: Ethiopian businesses fund verification tasks via **Safaricom M-Pesa STK Push** into escrow; youth workers complete them with anti-bot action timers; and approved earnings are disbursed straight to their M-Pesa wallet via **B2C payout**.

---

## 🏆 Hackathon Judging Criteria Alignment

| Criteria | Implementation in Ethio Bucks |
| :--- | :--- |
| **Innovation** | Escrow-backed micro-tasks on mobile money, anti-bot action timer protection, perceptual hash (`pHash`) duplicate proof detection, AI-assisted verification pre-screening, and gamified worker trust tiers. |
| **Use of M-Pesa** | End-to-end integration: **STK Push** for merchant escrow deposits, **B2C Payout** for instant worker cashouts, real-time webhook callback processing, and phone number as single source of identity. |
| **Impact** | Solves the youth income gap in Ethiopia by monetizing spare smartphone time with zero pay-to-join friction, while offering Ethiopian SMEs 80%+ marketing and local data cost savings over agencies. |
| **Feasibility** | Production-ready stack: React PWA, modular M-Pesa Daraja payment module, automated escrow release, transparent 15% platform fee, and instant B2C worker disbursal. |
| **Scalability** | PWA engineered for low-cost Android smartphones and weak networks, full local language support (English, አማርኛ, Afaan Oromo), and asynchronous payout queues. |

---

## 🚀 Key Features

### 1. Business Portal & STK Push Escrow
- **Post Campaigns:** Set custom slots (e.g. 50 slots) and reward per slot in Ethiopian Birr (ETB).
- **Transparent Fee Calculator:** Automatically calculates worker escrow pool + 15% platform fee.
- **M-Pesa STK Push:** Triggers a prompt directly to the business owner's Safaricom SIM card to lock funds securely into platform escrow before tasks go live.
- **Verification Queue:** Review pending worker screenshots with AI screening confidence scores and duplicate image hash alerts. 1-click **Approve** (instant escrow credit) or **Reject** with structured feedback.
- **Analytics & Cost Savings:** Real-time metrics comparing Ethio Bucks turnaround times and costs vs traditional agencies.

### 2. Worker Portal & Trust Tier System
- **Verified Account:** Safaricom phone number (+251 7XX XXX XXX) identity.
- **Gamified Trust Score:** Trust score (0–100) and worker tiers (**Bronze**, **Silver**, **Gold**, **Titan**) that unlock higher-paying campaigns.
- **Anti-Bot Action Timer:** Requires workers to spend genuine time executing the task before screenshot upload unlocks, preventing automated spamming.
- **Duplicate & AI Pre-Screening:** Immediate feedback upon proof selection to prevent accidental duplicates or invalid submissions.
- **Referral Program (Zero Pyramid):** Strict anti-pyramid policy where referral bonuses (15 ETB) unlock only after the invited friend completes their first verified business task.

### 3. Safaricom M-Pesa Interactive Phone Simulator
- Built-in realistic Safaricom smartphone view with:
  - Live **USSD / SIM Toolkit Push** prompt with PIN entry and DTMF audio tones.
  - Live **Official Safaricom M-PESA SMS Inbox** displaying B2C transaction alerts.

### 4. Daraja 2.0 API Sandbox Inspector
- Real-time JSON payload viewer demonstrating:
  - `POST /mpesa/stkpush/v1/processrequest`
  - `POST /api/mpesa/callbacks/stk`
  - `POST /mpesa/b2c/v1/paymentrequest`
  - `POST /api/mpesa/callbacks/b2c`

---

## ⏱️ 2-Minute Hackathon Demo Script

1. **Step 1 (Business Escrow):** Open Business Portal → Create task (50 slots @ 25 ETB) → Click Initiate STK Push → Watch the Safaricom phone prompt debit Till 789201.
2. **Step 2 (Worker Task & Timer):** Switch to Worker Portal → Select "Google Maps Review" → Observe guidelines and the anti-bot countdown timer.
3. **Step 3 (Proof Submission & AI Pre-Screen):** Choose screenshot proof → View live AI screening (96% Match) and duplicate hash pass status → Submit.
4. **Step 4 (Business Approval):** Switch to Verification Queue → Inspect AI recommendation → Click "Approve & Pay" → Hear the escrow payout chime!
5. **Step 5 (M-Pesa Cash-Out):** Click "Withdraw to M-Pesa" in Worker Portal → Confirm 50 ETB cashout → Watch confetti and inspect the M-Pesa B2C SMS receipt.

---

## 🛠️ Local Development & Quick Start

```bash
# Clone the repository
git clone https://github.com/oumersalah2-cmd/Safaricom-HT.git
cd Safaricom-HT

# Install dependencies
npm install

# Run the local development server
npm run dev

# Run Oxlint verification
npm run lint

# Build for production
npm run build
```

Open `http://localhost:5173/` in your browser.
