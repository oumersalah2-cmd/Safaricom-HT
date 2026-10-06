import { db } from './db.js';
import { smsService } from './smsService.js';

export const mpesaService = {
  // Generate realistic Daraja Receipt (e.g., SDF94MB81Z)
  generateReceipt() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SDF';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Initiate Daraja STK Push for Merchant Escrow Funding
  initiateStkPush({ phone, amount, shortcode = '789201', reference = 'Ethio Bucks Escrow' }) {
    const checkoutRequestId = "ws_CO_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    const receiptCode = this.generateReceipt();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const logEntry = {
      id: "log-" + Date.now(),
      timestamp,
      type: "STK_PUSH_REQUEST",
      endpoint: "/mpesa/stkpush/v1/processrequest",
      shortCode: shortcode,
      amountETB: Number(amount),
      phone: smsService.normalizePhone(phone),
      status: "SUCCESS",
      checkoutRequestId,
      details: `Escrow Deposit: ${Number(amount).toFixed(2)} ETB into Till ${shortcode} (${reference})`
    };

    db.update(data => {
      data.mpesa_transactions = [logEntry, ...(data.mpesa_transactions || [])];
      return data;
    });

    return {
      success: true,
      checkoutRequestId,
      receiptCode,
      amount: Number(amount),
      shortcode,
      customerMessage: `Success. Request accepted for processing on Safaricom phone ${phone}.`
    };
  },

  // Process Callback from STK Push
  processStkCallback({ checkoutRequestId, amount, businessId, receiptCode }) {
    const receipt = receiptCode || this.generateReceipt();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const callbackLog = {
      id: "log-" + Date.now(),
      timestamp,
      type: "STK_CALLBACK",
      endpoint: "/api/mpesa/callbacks/stk",
      resultCode: 0,
      resultDesc: "The service request is processed successfully.",
      mpesaReceipt: receipt,
      amountETB: Number(amount),
      status: "PROCESSED",
      details: `Escrow credited: ${Number(amount).toFixed(2)} ETB verified on Safaricom network.`
    };

    db.update(data => {
      data.mpesa_transactions = [callbackLog, ...(data.mpesa_transactions || [])];
      
      // Update business wallet if businessId provided
      if (businessId && data.wallets && data.wallets[businessId]) {
        data.wallets[businessId].balanceInEscrowETB = 
          (data.wallets[businessId].balanceInEscrowETB || 0) + Number(amount);
      }
      return data;
    });

    return { success: true, receipt };
  },

  // Instant B2C Cash-out for Workers
  initiateB2cPayout({ workerId, phone, amount }) {
    const amt = Number(amount);
    const data = db.read();
    const wallet = data.wallets?.[workerId];

    if (!wallet) {
      throw new Error('Worker wallet not found');
    }

    if (wallet.walletBalanceETB < amt) {
      throw new Error(`Insufficient wallet balance. Available: ${wallet.walletBalanceETB.toFixed(2)} ETB`);
    }

    if ((wallet.dailyWithdrawnETB + amt) > wallet.dailyLimitETB) {
      throw new Error(`Exceeds daily withdrawal limit of ${wallet.dailyLimitETB.toFixed(2)} ETB`);
    }

    const receiptCode = this.generateReceipt();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const conversationId = "AG_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    // Update wallet balances
    db.update(d => {
      d.wallets[workerId].walletBalanceETB -= amt;
      d.wallets[workerId].dailyWithdrawnETB += amt;

      const payoutLogs = [
        {
          id: "log-" + Date.now(),
          timestamp,
          type: "B2C_PAYOUT_REQUEST",
          endpoint: "/mpesa/b2c/v1/paymentrequest",
          phone: smsService.normalizePhone(phone),
          amountETB: amt,
          status: "QUEUED",
          conversationId,
          details: `Worker ${phone} requested cash-out of ${amt.toFixed(2)} ETB`
        },
        {
          id: "log-" + (Date.now() + 1),
          timestamp,
          type: "B2C_CALLBACK",
          endpoint: "/api/mpesa/callbacks/b2c",
          resultCode: 0,
          resultDesc: "The service request is processed successfully.",
          mpesaReceipt: receiptCode,
          amountETB: amt,
          status: "COMPLETED",
          details: `Disbursed ${amt.toFixed(2)} ETB to Safaricom M-Pesa phone ${phone}`
        }
      ];

      d.mpesa_transactions = [...payoutLogs, ...(d.mpesa_transactions || [])];
      return d;
    });

    // Send official Safaricom M-PESA SMS
    const dateFormatted = new Date().toLocaleDateString('en-GB');
    const sms = smsService.sendSms({
      phone,
      body: `${receiptCode} Confirmed. ${smsService.normalizePhone(phone)} has received ETB ${amt.toFixed(2)} from Ethio Bucks Escrow on ${dateFormatted}. Disbursed via Safaricom B2C API.`
    });

    return {
      success: true,
      receiptCode,
      amount: amt,
      phone,
      newBalance: wallet.walletBalanceETB - amt,
      sms
    };
  }
};
