import express from 'express';
import { db } from '../services/db.js';
import { mpesaService } from '../services/mpesaService.js';

const router = express.Router();

// Get wallet balance & stats
const getWalletHandler = (req, res) => {
  const userId = req.params.userId || req.query.userId || req.headers['x-user-id'] || 'usr-worker-1';
  const data = db.read();
  const wallet = data.wallets?.[userId] || {
    userId,
    walletBalanceETB: 0,
    escrowPendingETB: 0,
    lifetimeEarnedETB: 0,
    dailyWithdrawnETB: 0,
    dailyLimitETB: 2000
  };

  const user = (data.users || []).find(u => u.id === userId);
  const transactions = (data.mpesa_transactions || []).filter(t => 
    t.phone === user?.normalizedPhone || t.phone === user?.phone || t.type.includes('B2C')
  );

  return res.json({
    wallet,
    user,
    transactions
  });
};

router.get('/', getWalletHandler);
router.get('/:userId', getWalletHandler);

// Worker requests instant Safaricom M-Pesa B2C Cash-out
router.post('/withdraw', (req, res) => {
  const { workerId = 'usr-worker-1', phone, amount } = req.body;

  if (!amount || Number(amount) < 10) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is 10.00 ETB' });
  }

  try {
    const result = mpesaService.initiateB2cPayout({
      workerId,
      phone,
      amount: Number(amount)
    });

    return res.json({
      success: true,
      message: 'Withdrawal disbursed successfully via Safaricom B2C',
      ...result
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
