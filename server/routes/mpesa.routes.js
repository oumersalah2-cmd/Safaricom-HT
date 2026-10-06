import express from 'express';
import { db } from '../services/db.js';
import { mpesaService } from '../services/mpesaService.js';
import { smsService } from '../services/smsService.js';

const router = express.Router();

// Get M-Pesa Daraja Transaction Logs
router.get('/logs', (req, res) => {
  const transactions = db.get('mpesa_transactions') || [];
  return res.json(transactions);
});

// Get SMS notifications for user / phone
router.get('/sms', (req, res) => {
  const { phone } = req.query;
  if (phone) {
    return res.json(smsService.getSmsForPhone(phone));
  }
  const notifications = db.get('sms_notifications') || [];
  return res.json(notifications);
});

// Initiate STK Push
router.post('/stkpush', (req, res) => {
  const { phone, amount, shortcode = '789201', reference = 'Ethio Bucks Task Escrow' } = req.body;
  if (!phone || !amount) {
    return res.status(400).json({ error: 'Phone and amount are required' });
  }

  const result = mpesaService.initiateStkPush({
    phone,
    amount,
    shortcode,
    reference
  });

  return res.json(result);
});

// Webhook: STK Callback
router.post('/callbacks/stk', (req, res) => {
  const { checkoutRequestId, amount, businessId, receiptCode } = req.body;
  const result = mpesaService.processStkCallback({
    checkoutRequestId,
    amount,
    businessId,
    receiptCode
  });

  return res.json(result);
});

// Initiate B2C Payout
router.post('/b2c', (req, res) => {
  const { workerId, phone, amount } = req.body;
  try {
    const result = mpesaService.initiateB2cPayout({
      workerId,
      phone,
      amount
    });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
