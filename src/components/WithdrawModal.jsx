import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  worker, 
  onConfirmWithdraw,
  t 
}) {
  const [amount, setAmount] = useState(50);
  const [phoneNumber, setPhoneNumber] = useState(worker.phone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  if (!isOpen) return null;

  const handleQuickAmount = (val) => {
    setAmount(val);
    setErrorMsg('');
    sound.playKeypadBeep();
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount);

    if (isNaN(withdrawAmt) || withdrawAmt < 10) {
      setErrorMsg('Minimum withdrawal is 10.00 ETB');
      return;
    }

    if (withdrawAmt > worker.walletBalanceETB) {
      setErrorMsg(`Insufficient balance. You have ${worker.walletBalanceETB.toFixed(2)} ETB`);
      return;
    }

    if (worker.dailyWithdrawnETB + withdrawAmt > worker.dailyLimitETB) {
      setErrorMsg(`Exceeds daily withdrawal limit of ${worker.dailyLimitETB} ETB`);
      return;
    }

    setIsProcessing(true);
    sound.playMpesaTone();

    // Simulate instant Safaricom B2C payout
    setTimeout(() => {
      setIsProcessing(false);
      const receiptCode = "SDF" + Math.floor(100000 + Math.random() * 900000);
      
      setSuccessReceipt({
        receiptNumber: receiptCode,
        amount: withdrawAmt,
        phone: phoneNumber,
        timestamp: new Date().toLocaleTimeString(),
        newBalance: worker.walletBalanceETB - withdrawAmt
      });

      // Confetti burst for joyful payday!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      sound.playCashoutChime();
      onConfirmWithdraw(withdrawAmt, receiptCode);
    }, 1100);
  };

  const handleFinish = () => {
    setSuccessReceipt(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card withdraw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge badge-green mb-1">Instant B2C Payout</span>
            <h3>{t.withdrawBtn}</h3>
            <span className="text-xs text-muted">Direct to your Safaricom Ethiopia M-Pesa account</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {successReceipt ? (
            <div className="receipt-view animate-fade-in text-center">
              <div className="receipt-success-badge">
                <CheckCircle2 size={48} className="text-green mx-auto mb-2" />
                <h4 className="font-bold text-xl text-green">M-Pesa Payout Successful!</h4>
                <p className="text-xs text-muted">Funds instantly credited to your mobile wallet</p>
              </div>

              <div className="receipt-details-card glass-card my-4 text-left">
                <div className="receipt-row">
                  <span className="text-muted">M-Pesa Receipt:</span>
                  <strong>{successReceipt.receiptNumber}</strong>
                </div>
                <div className="receipt-row">
                  <span className="text-muted">Amount Disbursed:</span>
                  <strong className="text-green text-lg">{successReceipt.amount.toFixed(2)} ETB</strong>
                </div>
                <div className="receipt-row">
                  <span className="text-muted">Recipient Number:</span>
                  <strong>+251 {successReceipt.phone}</strong>
                </div>
                <div className="receipt-row">
                  <span className="text-muted">Disbursal Channel:</span>
                  <span className="badge badge-green badge-sm">Safaricom B2C API</span>
                </div>
                <div className="receipt-row">
                  <span className="text-muted">Transaction Fee:</span>
                  <span className="text-green font-bold">0.00 ETB (Free)</span>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg w-full"
                onClick={handleFinish}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="withdraw-form">
              {/* Balance Bar */}
              <div className="withdraw-balance-box">
                <div>
                  <span className="text-xs text-muted block">{t.availableBalance}:</span>
                  <strong className="text-2xl text-green font-bold">
                    {worker.walletBalanceETB.toFixed(2)} <span className="text-gold text-base">ETB</span>
                  </strong>
                </div>
                <div className="daily-limit-badge">
                  <span className="text-xs text-muted">Daily Limit:</span>
                  <span className="text-xs font-semibold">
                    {worker.dailyWithdrawnETB.toFixed(0)} / {worker.dailyLimitETB.toFixed(0)} ETB
                  </span>
                </div>
              </div>

              {/* Quick Amount Selector */}
              <div className="form-group">
                <label className="form-label">Select Amount to Cash Out:</label>
                <div className="quick-amount-pills">
                  {[25, 50, 100, Math.floor(worker.walletBalanceETB)].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`quick-amt-btn ${amount === val ? 'active' : ''}`}
                      onClick={() => handleQuickAmount(val)}
                    >
                      {val === Math.floor(worker.walletBalanceETB) ? `Max (${val})` : `${val} ETB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount input */}
              <div className="form-group">
                <label className="form-label">Or Custom Amount (ETB):</label>
                <input 
                  type="number" 
                  min="10"
                  max={worker.walletBalanceETB}
                  step="5"
                  className="form-input text-lg font-bold"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>

              {/* Safaricom Phone */}
              <div className="form-group">
                <label className="form-label">M-Pesa Registered Phone Number:</label>
                <div className="phone-prefix-input-wrap">
                  <span className="phone-prefix-tag">+251</span>
                  <input 
                    type="tel"
                    className="form-input pl-16"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <span className="text-xs text-muted mt-1 block">
                  Only Safaricom Ethiopia 07XX numbers receive instant B2C payouts.
                </span>
              </div>

              {errorMsg && (
                <div className="error-alert-box mb-3">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <span className="text-xs text-danger">{errorMsg}</span>
                </div>
              )}

              {/* Trust & Zero fee badge */}
              <div className="fee-waived-banner">
                <ShieldCheck size={18} className="text-green flex-shrink-0" />
                <span className="text-xs text-muted">
                  0% withdrawal fee for workers • Powered by Safaricom Daraja B2C
                </span>
              </div>

              {/* Submit CTA */}
              <div className="modal-actions-row mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isProcessing || worker.walletBalanceETB < 10}
                >
                  {isProcessing ? "Disbursing via M-Pesa..." : `Withdraw ${parseFloat(amount || 0).toFixed(2)} ETB`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
