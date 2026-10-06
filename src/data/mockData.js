// Initial mock data with rich Ethiopian context and M-Pesa transaction records

export const initialTasks = [
  {
    id: "task-101",
    businessId: "biz-1",
    businessName: "Tomoca Coffee Roasters",
    businessLogo: "☕",
    category: "appReview",
    title: "Google Maps 5-Star Review with Photo (Bole Branch)",
    description: "Visit our Google Maps profile for Tomoca Coffee Bole Medhanialem. Leave an honest 5-star review highlighting our signature macchiato or ambiance and attach a photo.",
    guidelines: [
      "Must have a Google Account with your real name",
      "Mention at least one coffee item (e.g. Macchiato, Sprice, Yirgacheffe brew)",
      "Upload a clear screenshot showing your posted review timestamp",
      "No copy-pasting existing reviews"
    ],
    rewardETB: 35.0,
    totalSlots: 100,
    completedSlots: 64,
    timerSeconds: 15, // realistic demo minimum action timer
    status: "active",
    minTier: "Bronze",
    createdAt: "2026-09-29T14:20:00Z",
    escrowLockedETB: 3500.0,
    proofType: "screenshot",
    targetUrl: "https://maps.google.com/?q=Tomoca+Coffee+Bole+Addis+Ababa"
  },
  {
    id: "task-102",
    businessId: "biz-2",
    businessName: "Kuraz Delivery Tech",
    businessLogo: "🛵",
    category: "testing",
    title: "Install Kuraz App & Test Search for Addis Restaurants",
    description: "Download the Kuraz Delivery app APK/Play Store beta, search for 3 local restaurants in Kazanchis or Piassa, and submit feedback on search speed.",
    guidelines: [
      "Open Kuraz App and register with your Safaricom number",
      "Perform a search query for 'Injera' or 'Burger'",
      "Take a screenshot of the search results screen showing your phone battery bar",
      "Note down any lag or bug encountered"
    ],
    rewardETB: 50.0,
    totalSlots: 50,
    completedSlots: 22,
    timerSeconds: 20,
    status: "active",
    minTier: "Silver",
    createdAt: "2026-09-30T06:15:00Z",
    escrowLockedETB: 2500.0,
    proofType: "screenshot",
    targetUrl: "https://kurazdelivery.et/download"
  },
  {
    id: "task-103",
    businessId: "biz-3",
    businessName: "Safaricom Retail Partner Bole",
    businessLogo: "📶",
    category: "surveys",
    title: "Safaricom 5G & M-Pesa Experience 3-Minute Survey",
    description: "Fill out our brief survey regarding your experience with Safaricom 5G speeds and M-Pesa merchant pay bill usage around Addis Ababa universities.",
    guidelines: [
      "Answer all 7 multiple-choice questions honestly",
      "Enter your active Safaricom 07XX mobile number at the end of the survey",
      "Submit screenshot of the 'Thank You! Response Recorded' page"
    ],
    rewardETB: 25.0,
    totalSlots: 200,
    completedSlots: 142,
    timerSeconds: 15,
    status: "active",
    minTier: "Bronze",
    createdAt: "2026-09-29T10:00:00Z",
    escrowLockedETB: 5000.0,
    proofType: "screenshot",
    targetUrl: "https://forms.gle/safaricom-experience-survey"
  },
  {
    id: "task-104",
    businessId: "biz-4",
    businessName: "Habesha Tech YouTube",
    businessLogo: "📺",
    category: "social",
    title: "Watch 2 Mins of M-Pesa Tutorial & Leave Constructive Comment",
    description: "Watch our Amharic video guide on 'How to link Safaricom M-Pesa with Ethiopian Mobile Banking', subscribe and drop a comment with #EthioTech.",
    guidelines: [
      "Watch at least 2 minutes of the video",
      "Drop an Amharic or English comment with #EthioTech",
      "Upload screenshot showing the red 'Subscribed' bell and your posted comment"
    ],
    rewardETB: 20.0,
    totalSlots: 150,
    completedSlots: 118,
    timerSeconds: 12,
    status: "active",
    minTier: "Bronze",
    createdAt: "2026-09-28T18:00:00Z",
    escrowLockedETB: 3000.0,
    proofType: "screenshot",
    targetUrl: "https://youtube.com/watch?v=sample-ethio-mpesa"
  },
  {
    id: "task-105",
    businessId: "biz-5",
    businessName: "Addis Agri Mart",
    businessLogo: "🌾",
    category: "localData",
    title: "Verify Teff Price per Quintal at Local Shola/Merkato Shop",
    description: "We are compiling real-time grain index prices across Addis Ababa. Take a photo of the price board or ask a merchant for Magna Teff price in your subcity.",
    guidelines: [
      "Specify shop name, sub-city (e.g. Yeka, Kirkos, Bole, Gulele)",
      "Provide current price per quintal in ETB",
      "Upload a clear photo of the store front or price tag"
    ],
    rewardETB: 75.0,
    totalSlots: 40,
    completedSlots: 8,
    timerSeconds: 25,
    status: "active",
    minTier: "Gold",
    createdAt: "2026-09-30T07:45:00Z",
    escrowLockedETB: 3000.0,
    proofType: "screenshot",
    targetUrl: "#"
  }
];

export const initialWorker = {
  id: "worker-901",
  name: "Kidus Girma",
  phone: "0712 345 678",
  fullPhone: "+251712345678",
  network: "Safaricom Ethiopia",
  avatar: "👨🏽‍💻",
  tier: "Silver",
  trustScore: 94,
  completedTasks: 38,
  approvedRate: "97.4%",
  walletBalanceETB: 185.00,
  escrowPendingETB: 85.00,
  lifetimeEarnedETB: 1420.00,
  referralCode: "TITAN-ET-8821",
  referralCount: 4,
  referralUnlockedETB: 60.00,
  dailyWithdrawnETB: 0.00,
  dailyLimitETB: 2000.00
};

export const initialBusiness = {
  id: "biz-1",
  name: "Tomoca Coffee Roasters",
  legalName: "Tomoca Coffee PLC (Ethiopia)",
  verified: true,
  shortcode: "789201",
  mpesaTill: "251789201",
  balanceInEscrowETB: 3500.00,
  activeCampaignsCount: 3,
  totalTasksApproved: 246,
  totalSpentETB: 8610.00,
  avgReviewTimeMinutes: 4.2
};

export const initialSubmissions = [
  {
    id: "sub-501",
    taskId: "task-101",
    taskTitle: "Google Maps 5-Star Review with Photo (Bole Branch)",
    workerId: "worker-901",
    workerName: "Kidus Girma",
    workerPhone: "0712 345 678",
    workerTier: "Silver",
    workerTrustScore: 94,
    submittedAt: "2026-09-30T08:15:00Z",
    proofImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    proofText: "Posted Google Maps review: 'Best macchiato in Bole! Super quick Wi-Fi and friendly baristas.' Attached fresh cup photo.",
    status: "pending",
    rewardETB: 35.0,
    aiScreening: {
      passed: true,
      confidence: 96,
      summary: "High confidence. Google Maps UI layout detected, 5 stars visible, reviewer name matches profile, timestamp verified within 1 hour.",
      sentiment: "Positive (5 Stars)",
      detectedText: "Tomoca Coffee Bole Medhanialem • 5 stars • 15 mins ago • 'Best macchiato in Bole!'"
    },
    duplicateCheck: {
      isDuplicate: false,
      hash: "pHash-a98f12c8b7410e3d",
      similarityScore: 0.02,
      note: "Original image. No matching perceptual hash in the last 10,000 platform submissions."
    }
  },
  {
    id: "sub-502",
    taskId: "task-102",
    taskTitle: "Install Kuraz App & Test Search for Addis Restaurants",
    workerId: "worker-901",
    workerName: "Kidus Girma",
    workerPhone: "0712 345 678",
    workerTier: "Silver",
    workerTrustScore: 94,
    submittedAt: "2026-09-30T08:32:00Z",
    proofImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    proofText: "Downloaded APK, searched for 'Kazanchis Tibs', found 4 restaurants in 1.4s.",
    status: "pending",
    rewardETB: 50.0,
    aiScreening: {
      passed: true,
      confidence: 91,
      summary: "Kuraz search bar detected with query text 'Kazanchis Tibs' and restaurant list results displayed.",
      sentiment: "Neutral / Objective",
      detectedText: "Kuraz Food • Results for Kazanchis Tibs • 4 spots found"
    },
    duplicateCheck: {
      isDuplicate: false,
      hash: "pHash-c47e819b22a0f81d",
      similarityScore: 0.04,
      note: "Unique screenshot. Device status bar matches worker phone resolution."
    }
  },
  {
    id: "sub-503",
    taskId: "task-101",
    taskTitle: "Google Maps 5-Star Review with Photo (Bole Branch)",
    workerId: "worker-404",
    workerName: "Yonas Bekele",
    workerPhone: "0755 112 233",
    workerTier: "Bronze",
    workerTrustScore: 78,
    submittedAt: "2026-09-30T07:50:00Z",
    proofImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    proofText: "Done review",
    status: "pending",
    rewardETB: 35.0,
    aiScreening: {
      passed: false,
      confidence: 42,
      summary: "Warning: Low text clarity. Reviewer name is obscured and star rating is ambiguous.",
      sentiment: "Inconclusive",
      detectedText: "Tomoca Coffee • blurry text • no rating visible"
    },
    duplicateCheck: {
      isDuplicate: true,
      hash: "pHash-a98f12c8b7410e3d",
      similarityScore: 0.89,
      note: "Potential Duplicate! Perceptual hash 89% match with sub-498 from another worker 3 days ago."
    }
  },
  {
    id: "sub-499",
    taskId: "task-103",
    taskTitle: "Watch Safaricom M-Pesa SuperApp Intro Video & Subscribe",
    workerId: "worker-901",
    workerName: "Kidus Girma",
    workerPhone: "0712 345 678",
    workerTier: "Silver",
    workerTrustScore: 94,
    submittedAt: "2026-09-29T10:15:00Z",
    proofImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80",
    proofText: "Subscribed and watched 2 mins of M-Pesa SuperApp video. Attached screenshot of bell notification.",
    status: "approved",
    rewardETB: 20.0,
    mpesaReceipt: "SDF881023",
    aiScreening: {
      passed: true,
      confidence: 98,
      summary: "Verified YouTube subscription button active, bell icon toggled, timestamp matches video release.",
      sentiment: "Positive",
      detectedText: "Subscribed • Safaricom Ethiopia • Notifications All"
    },
    duplicateCheck: {
      isDuplicate: false,
      hash: "pHash-f91b00248c823e41",
      similarityScore: 0.01,
      note: "Clean, verified original capture."
    }
  },
  {
    id: "sub-490",
    taskId: "task-104",
    taskTitle: "Local Price Survey at Megabi Market",
    workerId: "worker-901",
    workerName: "Kidus Girma",
    workerPhone: "0712 345 678",
    workerTier: "Silver",
    workerTrustScore: 94,
    submittedAt: "2026-09-27T14:00:00Z",
    proofImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
    proofText: "Market survey attempt.",
    status: "rejected",
    rejectionReason: "Screenshot was blurry and store price board was not legible. Please retake under good lighting.",
    rewardETB: 25.0,
    aiScreening: {
      passed: false,
      confidence: 51,
      summary: "Blur detected in lower region. Text OCR could not decipher grain unit pricing.",
      sentiment: "Inconclusive",
      detectedText: "blur detected • price illegible"
    },
    duplicateCheck: {
      isDuplicate: false,
      hash: "pHash-12ca94b7e80f551b",
      similarityScore: 0.03,
      note: "Unique capture."
    }
  }
];

export const sampleProofTemplates = [
  {
    id: "preset-1",
    name: "Valid Google Review (Tomoca Coffee)",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    description: "Genuine photo with 5-star rating on Google Maps",
    mockAiConfidence: 97,
    isDup: false,
    text: "5-star rating posted: 'Superb macchiato and friendly staff at Bole!'"
  },
  {
    id: "preset-2",
    name: "App Testing Screenshot (Kuraz)",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    description: "App search results with active UI elements",
    mockAiConfidence: 94,
    isDup: false,
    text: "Search tested for 'Injera combo' - load time was ~1.2s, smooth UI."
  },
  {
    id: "preset-3",
    name: "Duplicate / Reused Screenshot (Flagged)",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    description: "Reused image from an older task (Triggers duplicate hash warning)",
    mockAiConfidence: 45,
    isDup: true,
    text: "Tried to submit previously uploaded proof."
  }
];

export const initialMpesaLogs = [
  {
    id: "log-1",
    timestamp: "2026-09-30 08:12:04",
    type: "STK_PUSH_REQUEST",
    endpoint: "/mpesa/stkpush/v1/processrequest",
    shortCode: "789201",
    amountETB: 3500.0,
    phone: "251789201000",
    status: "SUCCESS",
    checkoutRequestId: "ws_CO_30092026081204123456",
    details: "Merchant Escrow Deposit - 100 slots @ 35 ETB"
  },
  {
    id: "log-2",
    timestamp: "2026-09-30 08:12:18",
    type: "STK_CALLBACK",
    endpoint: "/api/mpesa/callbacks/stk",
    resultCode: 0,
    resultDesc: "The service request is processed successfully.",
    mpesaReceipt: "SDF91KA49X",
    amountETB: 3500.0,
    status: "PROCESSED",
    details: "Escrow account credited: 3,500.00 ETB. Task-101 published live."
  },
  {
    id: "log-3",
    timestamp: "2026-09-30 08:28:45",
    type: "B2C_PAYOUT_REQUEST",
    endpoint: "/mpesa/b2c/v1/paymentrequest",
    phone: "251712345678",
    amountETB: 150.0,
    status: "QUEUED",
    conversationId: "AG_20260930_0000572b9a712f5c",
    details: "Worker Wallet Withdrawal to Safaricom M-Pesa"
  },
  {
    id: "log-4",
    timestamp: "2026-09-30 08:28:48",
    type: "B2C_CALLBACK",
    endpoint: "/api/mpesa/callbacks/b2c",
    resultCode: 0,
    resultDesc: "The service request is processed successfully.",
    mpesaReceipt: "SDF94MB81Z",
    amountETB: 150.0,
    status: "COMPLETED",
    details: "Worker 0712 345 678 credited 150.00 ETB via M-Pesa B2C."
  }
];

export const rejectionReasons = [
  "Incomplete steps: Instructions were not fully followed",
  "Low quality / Blurry screenshot: Cannot verify text or details",
  "Duplicate proof: Screenshot previously used by another account",
  "Incorrect account or target: Proof does not match the requested campaign",
  "Spam or automated submission detected"
];
