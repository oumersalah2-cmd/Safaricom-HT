import express from 'express';
import { db } from '../services/db.js';
import { mpesaService } from '../services/mpesaService.js';
import { smsService } from '../services/smsService.js';

const router = express.Router();

// Get all tasks with filtering
router.get('/', (req, res) => {
  const { category, search, minTier, businessId } = req.query;
  let tasks = db.get('tasks') || [];

  if (category && category !== 'all') {
    tasks = tasks.filter(t => t.category === category);
  }

  if (minTier && minTier !== 'all') {
    tasks = tasks.filter(t => t.minTier === minTier);
  }

  if (businessId) {
    tasks = tasks.filter(t => t.businessId === businessId);
  }

  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.businessName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  }

  return res.json(tasks);
});

// Get task details
router.get('/:id', (req, res) => {
  const tasks = db.get('tasks') || [];
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  return res.json(task);
});

// Create new task campaign (Funded via Safaricom M-Pesa STK Push)
router.post('/', (req, res) => {
  const { 
    businessId,
    businessName,
    title, 
    description, 
    category = 'appReview', 
    rewardETB, 
    totalSlots, 
    guidelines = [],
    minTier = 'Bronze',
    targetUrl = '#',
    phone,
    stkReceipt
  } = req.body;

  if (!title || !description || !rewardETB || !totalSlots) {
    return res.status(400).json({ error: 'Title, description, reward, and slots are required.' });
  }

  const reward = Number(rewardETB);
  const slots = Number(totalSlots);
  const escrowWorkerPool = reward * slots;
  const platformFee = escrowWorkerPool * 0.15;
  const totalEscrowRequired = escrowWorkerPool + platformFee;

  const data = db.read();
  const business = (data.users || []).find(u => u.id === businessId) || {
    id: businessId || 'usr-business-1',
    name: businessName || 'Verified Merchant',
    avatar: '🏢',
    shortcode: '789201'
  };

  const newTaskId = `task-${Date.now().toString(36)}`;
  const receipt = stkReceipt || mpesaService.generateReceipt();

  const newTask = {
    id: newTaskId,
    businessId: business.id,
    businessName: business.name,
    businessLogo: business.avatar || '⭐',
    category,
    title,
    description,
    guidelines: Array.isArray(guidelines) ? guidelines : [guidelines],
    rewardETB: reward,
    totalSlots: slots,
    completedSlots: 0,
    timerSeconds: 15,
    status: 'active',
    minTier,
    createdAt: new Date().toISOString(),
    escrowLockedETB: totalEscrowRequired,
    proofType: 'screenshot',
    targetUrl: targetUrl || '#'
  };

  // Add task & record escrow transaction
  db.update(d => {
    d.tasks = [newTask, ...(d.tasks || [])];
    d.wallets = d.wallets || {};
    
    if (d.wallets[business.id]) {
      d.wallets[business.id].balanceInEscrowETB = 
        (d.wallets[business.id].balanceInEscrowETB || 0) + totalEscrowRequired;
      d.wallets[business.id].activeCampaignsCount = 
        (d.wallets[business.id].activeCampaignsCount || 0) + 1;
    }
    return d;
  });

  // Log STK Callback and Transaction
  mpesaService.processStkCallback({
    checkoutRequestId: "ws_CO_" + Date.now(),
    amount: totalEscrowRequired,
    businessId: business.id,
    receiptCode: receipt
  });

  // Send M-Pesa Confirmation SMS
  if (phone || business.phone) {
    const notifyPhone = phone || business.phone;
    smsService.sendSms({
      phone: notifyPhone,
      body: `${receipt} Confirmed. ETB ${totalEscrowRequired.toFixed(2)} paid to Ethio Bucks Escrow (Till ${business.shortcode || '789201'}) for campaign '${title}'. Safaricom Ethiopia.`
    });
  }

  return res.status(201).json({
    success: true,
    task: newTask,
    receipt,
    escrowAmount: totalEscrowRequired
  });
});

export default router;
