import express from 'express';
import { db } from '../services/db.js';
import { aiService } from '../services/aiService.js';
import { mpesaService } from '../services/mpesaService.js';
import { smsService } from '../services/smsService.js';

const router = express.Router();

// Get submissions with filters
router.get('/', (req, res) => {
  const { workerId, businessId, taskId, status } = req.query;
  let submissions = db.get('submissions') || [];

  if (workerId) {
    submissions = submissions.filter(s => s.workerId === workerId);
  }

  if (taskId) {
    submissions = submissions.filter(s => s.taskId === taskId);
  }

  if (businessId) {
    const tasks = db.get('tasks') || [];
    const bizTaskIds = new Set(tasks.filter(t => t.businessId === businessId).map(t => t.id));
    submissions = submissions.filter(s => bizTaskIds.has(s.taskId));
  }

  if (status && status !== 'all') {
    submissions = submissions.filter(s => s.status === status);
  }

  return res.json(submissions);
});

// Submit proof of micro-task execution
router.post('/', (req, res) => {
  const { 
    taskId, 
    workerId, 
    proofImage, 
    proofText = ''
  } = req.body;

  if (!taskId || !workerId || !proofImage) {
    return res.status(400).json({ error: 'Task ID, Worker ID, and proof image are required' });
  }

  const data = db.read();
  const task = (data.tasks || []).find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const worker = (data.users || []).find(u => u.id === workerId) || {
    id: workerId,
    name: 'Kidus Girma',
    phone: '0712 345 678',
    tier: 'Silver',
    trustScore: 94
  };

  // Run AI perceptual hashing & duplicate screening
  const pHash = aiService.generatePerceptualHash(proofImage, proofText);
  const dupCheck = aiService.checkDuplicate(pHash);
  const aiScreen = aiService.screenProof({ proofImage, proofText, taskTitle: task.title });

  const newSubId = `sub-${Date.now().toString(36)}`;
  const newSubmission = {
    id: newSubId,
    taskId: task.id,
    taskTitle: task.title,
    businessId: task.businessId,
    businessName: task.businessName,
    workerId: worker.id,
    workerName: worker.name,
    workerPhone: worker.phone,
    workerTier: worker.tier || 'Silver',
    workerTrustScore: worker.trustScore || 90,
    submittedAt: new Date().toISOString(),
    proofImage,
    proofText,
    status: 'pending',
    rewardETB: task.rewardETB,
    aiScreening: aiScreen,
    duplicateCheck: {
      isDuplicate: dupCheck.isDuplicate,
      hash: pHash,
      similarityScore: dupCheck.similarityScore,
      note: dupCheck.note
    }
  };

  // Update DB: add submission, increment completedSlots, add pending escrow for worker
  db.update(d => {
    d.submissions = [newSubmission, ...(d.submissions || [])];
    
    // Increment completed slot count
    d.tasks = (d.tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completedSlots: Math.min(t.totalSlots, (t.completedSlots || 0) + 1)
        };
      }
      return t;
    });

    // Update worker pending escrow
    d.wallets = d.wallets || {};
    if (d.wallets[worker.id]) {
      d.wallets[worker.id].escrowPendingETB = 
        (d.wallets[worker.id].escrowPendingETB || 0) + task.rewardETB;
    }

    return d;
  });

  return res.status(201).json({
    success: true,
    submission: newSubmission
  });
});

// Business approves submission -> Releases escrow to worker wallet
router.post('/:id/approve', (req, res) => {
  const subId = req.params.id;
  const data = db.read();
  const sub = (data.submissions || []).find(s => s.id === subId);

  if (!sub) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  if (sub.status === 'approved') {
    return res.status(400).json({ error: 'Submission already approved' });
  }

  const receipt = mpesaService.generateReceipt();
  const reward = Number(sub.rewardETB);

  db.update(d => {
    // 1. Update submission status
    d.submissions = (d.submissions || []).map(s => {
      if (s.id === subId) {
        return { ...s, status: 'approved', mpesaReceipt: receipt };
      }
      return s;
    });

    // 2. Credit worker wallet & adjust escrow
    if (d.wallets && d.wallets[sub.workerId]) {
      const w = d.wallets[sub.workerId];
      w.walletBalanceETB = (w.walletBalanceETB || 0) + reward;
      w.escrowPendingETB = Math.max(0, (w.escrowPendingETB || 0) - reward);
      w.lifetimeEarnedETB = (w.lifetimeEarnedETB || 0) + reward;
    }

    // 3. Debit business escrow balance
    const task = (d.tasks || []).find(t => t.id === sub.taskId);
    const bizId = task?.businessId || sub.businessId;
    if (bizId && d.wallets && d.wallets[bizId]) {
      const b = d.wallets[bizId];
      b.balanceInEscrowETB = Math.max(0, (b.balanceInEscrowETB || 0) - reward);
      b.totalTasksApproved = (b.totalTasksApproved || 0) + 1;
    }

    // 4. Log escrow release in M-Pesa ledger
    const approveLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: "ESCROW_RELEASE_CREDIT",
      endpoint: "/api/escrow/release",
      amountETB: reward,
      status: "SUCCESS",
      mpesaReceipt: receipt,
      details: `Escrow released: ${reward.toFixed(2)} ETB credited to worker ${sub.workerName}`
    };
    d.mpesa_transactions = [approveLog, ...(d.mpesa_transactions || [])];

    return d;
  });

  // 5. Send Safaricom M-Pesa SMS to worker
  smsService.sendSms({
    phone: sub.workerPhone,
    body: `${receipt} Confirmed. Submission for '${sub.taskTitle}' approved! ETB ${reward.toFixed(2)} credited to your Ethio Bucks wallet. Safaricom Ethiopia.`
  });

  return res.json({
    success: true,
    message: 'Submission approved and escrow released successfully',
    receipt,
    rewardETB: reward
  });
});

// Business rejects submission with explanation
router.post('/:id/reject', (req, res) => {
  const subId = req.params.id;
  const { reason = 'Proof does not meet task guidelines' } = req.body;
  const data = db.read();
  const sub = (data.submissions || []).find(s => s.id === subId);

  if (!sub) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  const reward = Number(sub.rewardETB);

  db.update(d => {
    // 1. Mark as rejected
    d.submissions = (d.submissions || []).map(s => {
      if (s.id === subId) {
        return { ...s, status: 'rejected', rejectionReason: reason };
      }
      return s;
    });

    // 2. Remove pending escrow from worker
    if (d.wallets && d.wallets[sub.workerId]) {
      const w = d.wallets[sub.workerId];
      w.escrowPendingETB = Math.max(0, (w.escrowPendingETB || 0) - reward);
    }

    // 3. Lower worker trust score slightly if fraudulent
    d.users = (d.users || []).map(u => {
      if (u.id === sub.workerId && u.trustScore) {
        return { ...u, trustScore: Math.max(50, u.trustScore - 2) };
      }
      return u;
    });

    return d;
  });

  // Send explanatory SMS to worker
  smsService.sendSms({
    phone: sub.workerPhone,
    body: `Ethio Bucks Notice: Your submission for '${sub.taskTitle}' was rejected. Reason: ${reason}. Please check verification guidelines.`
  });

  return res.json({
    success: true,
    message: 'Submission rejected',
    rejectionReason: reason
  });
});

export default router;
