import express from 'express';
import { db } from '../services/db.js';
import { smsService } from '../services/smsService.js';

const router = express.Router();

// Generate 6-digit OTP and dispatch via Safaricom SMS
router.post('/send-otp', (req, res) => {
  const { phone, role = 'worker' } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const normPhone = smsService.normalizePhone(phone);
  if (!normPhone.startsWith('2517') && !normPhone.startsWith('2519')) {
    return res.status(400).json({ 
      error: 'Please enter a valid Safaricom Ethiopia mobile number (07XX XXX XXX)' 
    });
  }

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.update(data => {
    data.otps = data.otps || {};
    data.otps[normPhone] = {
      code,
      expiresAt,
      role
    };
    return data;
  });

  // Send official Safaricom verification SMS
  const sms = smsService.sendSms({
    phone,
    sender: 'M-PESA',
    body: `Your Ethio Bucks verification code is ${code}. Valid for 5 minutes. Do not share this code. Safaricom Ethiopia.`
  });

  return res.json({
    success: true,
    message: `OTP sent successfully to ${smsService.formatDisplayPhone(phone)}`,
    phone: smsService.formatDisplayPhone(phone),
    normalizedPhone: normPhone,
    // Provide code in dev response for frictionless testing
    demoCode: code,
    sms
  });
});

// Verify OTP & Sign In / Register
router.post('/verify-otp', (req, res) => {
  const { phone, code, name, role = 'worker', tier = 'Silver' } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and OTP code are required' });
  }

  const normPhone = smsService.normalizePhone(phone);
  const data = db.read();
  const storedOtp = data.otps?.[normPhone];

  // Validate OTP code (or accept test master code 123456)
  if ((!storedOtp || storedOtp.code !== code.trim()) && code.trim() !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  // Check if user already exists with this phone
  let user = (data.users || []).find(u => u.normalizedPhone === normPhone);

  if (!user) {
    // Register new user
    const newId = `usr-${role}-${Date.now().toString(36)}`;
    const displayPhone = smsService.formatDisplayPhone(phone);
    const assignedName = name || (role === 'worker' ? 'New Worker' : 'New Merchant');
    
    user = {
      id: newId,
      phone: displayPhone,
      normalizedPhone: normPhone,
      role,
      name: assignedName,
      avatar: role === 'worker' ? '👤' : '🏢',
      tier: role === 'worker' ? (tier || 'Silver') : undefined,
      trustScore: role === 'worker' ? 90 : undefined,
      network: 'Safaricom Ethiopia',
      verified: true,
      referralCode: `ETHIO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referralCount: 0,
      referralUnlockedETB: 0,
      createdAt: new Date().toISOString()
    };

    if (role === 'business') {
      user.shortcode = Math.floor(600000 + Math.random() * 300000).toString();
      user.mpesaTill = "251" + user.shortcode;
    }

    db.update(d => {
      d.users = [...(d.users || []), user];
      d.wallets = d.wallets || {};
      if (role === 'worker') {
        d.wallets[user.id] = {
          userId: user.id,
          walletBalanceETB: 50.0, // Welcome bonus!
          escrowPendingETB: 0.0,
          lifetimeEarnedETB: 50.0,
          dailyWithdrawnETB: 0.0,
          dailyLimitETB: 2000.0
        };
      } else {
        d.wallets[user.id] = {
          userId: user.id,
          balanceInEscrowETB: 0.0,
          totalSpentETB: 0.0,
          totalTasksApproved: 0,
          activeCampaignsCount: 0
        };
      }
      return d;
    });

    // Send Welcome SMS
    smsService.sendSms({
      phone,
      body: `Welcome to Ethio Bucks! Your account is verified on Safaricom M-Pesa. Start earning or posting verified micro-tasks.`
    });
  }

  // Clear used OTP
  db.update(d => {
    if (d.otps) delete d.otps[normPhone];
    return d;
  });

  const refreshedData = db.read();
  const wallet = refreshedData.wallets?.[user.id] || {};

  return res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user,
    wallet
  });
});

// Get Current User Profile and Wallet
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'] || (authHeader ? authHeader.replace('Bearer token_', '').split('_')[0] : null);

  const data = db.read();
  let user = userId ? (data.users || []).find(u => u.id === userId) : null;

  if (!user) {
    // Default fallback to first worker if no auth header
    user = (data.users || []).find(u => u.role === 'worker') || data.users[0];
  }

  const wallet = data.wallets?.[user.id] || {};
  const sms = smsService.getSmsForPhone(user.phone);

  return res.json({
    user,
    wallet,
    sms
  });
});

// List Accounts for Quick Testing
router.get('/demo-accounts', (req, res) => {
  const data = db.read();
  const users = data.users || [];
  return res.json({
    workers: users.filter(u => u.role === 'worker'),
    businesses: users.filter(u => u.role === 'business')
  });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
