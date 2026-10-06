import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Store,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../utils/audio';

export function AuthScreen({ onLoginSuccess, t }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('0712 345 678');
  const [name, setName] = useState('');
  const [role, setRole] = useState('worker'); // 'worker' | 'business'
  const [otpCode, setOtpCode] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Send OTP via Safaricom
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    sound.playKeypadBeep();

    try {
      const res = await api.auth.sendOtp(phone, role);
      setDemoCodeHint(res.demoCode || '123456');
      setStep('otp');
      sound.playSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch OTP code. Check your phone number.');
      sound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    sound.playKeypadBeep();

    try {
      const res = await api.auth.verifyOtp(phone, otpCode, name, role);
      sound.playMpesaTone();
      onLoginSuccess(res.user, res.wallet);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
      sound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Profile Login for Instant Access
  const handleQuickLogin = async (targetPhone, targetRole, targetName) => {
    setIsLoading(true);
    setErrorMessage('');
    sound.playKeypadBeep();

    try {
      // Use standard master code
      const res = await api.auth.verifyOtp(targetPhone, '123456', targetName, targetRole);
      sound.playSuccess();
      onLoginSuccess(res.user, res.wallet);
    } catch (err) {
      // If user doesn't exist, send OTP then verify
      try {
        const otpRes = await api.auth.sendOtp(targetPhone, targetRole);
        const verifyRes = await api.auth.verifyOtp(targetPhone, otpRes.demoCode || '123456', targetName, targetRole);
        sound.playSuccess();
        onLoginSuccess(verifyRes.user, verifyRes.wallet);
      } catch (e2) {
        setErrorMessage(e2.message || 'Quick login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen-overlay animate-fade-in">
      <div className="auth-card glass-card">
        {/* Brand Header */}
        <div className="auth-header text-center">
          <div className="auth-logo-badge mx-auto mb-3">
            <span className="logo-ethio font-extrabold text-2xl">Ethio</span>
            <span className="logo-bucks font-extrabold text-2xl text-green">Bucks</span>
          </div>
          <span className="badge badge-green badge-sm mb-2">Powered by Safaricom M-Pesa</span>
          <h2 className="text-xl font-bold">Micro-Task Platform</h2>
          <p className="text-xs text-muted mt-1">
            Sign in with your Safaricom Ethiopia mobile number
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner flex items-center gap-2 my-3">
            <AlertCircle size={16} className="text-danger flex-shrink-0" />
            <span className="text-xs text-danger">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Phone & Role Selection */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="auth-form mt-4">
            <div className="form-group mb-3">
              <label className="form-label text-xs font-semibold text-muted">Account Type:</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  className={`role-select-btn ${role === 'worker' ? 'active' : ''}`}
                  onClick={() => { setRole('worker'); sound.playKeypadBeep(); }}
                >
                  <Briefcase size={16} />
                  <span>Micro-Worker</span>
                </button>
                <button
                  type="button"
                  className={`role-select-btn ${role === 'business' ? 'active' : ''}`}
                  onClick={() => { setRole('business'); sound.playKeypadBeep(); }}
                >
                  <Store size={16} />
                  <span>Merchant</span>
                </button>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="form-label text-xs font-semibold text-muted">
                Safaricom Mobile Number:
              </label>
              <div className="phone-prefix-input-wrap">
                <span className="phone-prefix-tag text-xs font-bold">+251</span>
                <input
                  type="text"
                  className="form-input pl-14"
                  placeholder="07XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <span className="text-xs text-faint block mt-1">
                A 6-digit SMS verification code will be sent to your phone.
              </span>
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-xs font-semibold text-muted">Full Name / Business Name (Optional):</label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'worker' ? 'e.g., Kidus Girma' : 'e.g., Tomoca Coffee PLC'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Smartphone size={16} />
              <span>{isLoading ? 'Sending SMS OTP...' : 'Send Safaricom OTP Code'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="auth-form mt-4">
            <div className="otp-dispatched-box p-3 rounded glass-card mb-3 text-center">
              <ShieldCheck size={28} className="text-green mx-auto mb-1" />
              <span className="text-xs text-muted block">Enter the 6-digit code sent to:</span>
              <strong className="text-sm font-mono text-green">+251 {phone}</strong>
              {demoCodeHint && (
                <div 
                  className="mt-2 text-xs bg-slate-900/80 p-1.5 rounded cursor-pointer border border-glass"
                  onClick={() => setOtpCode(demoCodeHint)}
                  title="Click to auto-fill"
                >
                  <span className="text-gold font-bold">Auto-fill OTP: </span>
                  <span className="font-mono text-white underline">{demoCodeHint}</span>
                </div>
              )}
            </div>

            <div className="form-group mb-4">
              <label className="form-label text-xs font-semibold text-muted">6-Digit Code:</label>
              <input
                type="text"
                maxLength="6"
                className="form-input text-center font-mono text-2xl tracking-widest"
                placeholder="••••••"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => { setStep('phone'); setErrorMessage(''); }}
              >
                Change Phone
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 flex items-center justify-center gap-1"
                disabled={isLoading || otpCode.length < 4}
              >
                <Lock size={15} />
                <span>{isLoading ? 'Verifying...' : 'Verify & Enter'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Switcher Section */}
        <div className="quick-switch-section mt-6 pt-4 border-t border-glass">
          <span className="text-xs text-muted block text-center mb-2">⚡ Quick Sign-In (Instant Access):</span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="quick-demo-login-btn"
              onClick={() => handleQuickLogin('0712 345 678', 'worker', 'Kidus Girma')}
            >
              <span className="text-base">👨🏽‍💻</span>
              <div className="text-left">
                <span className="font-semibold text-xs block text-white">Worker: Kidus Girma</span>
                <span className="text-xs text-muted">185.00 ETB Balance • Silver Tier</span>
              </div>
              <span className="badge badge-xs badge-green ml-auto">Worker</span>
            </button>

            <button
              type="button"
              className="quick-demo-login-btn"
              onClick={() => handleQuickLogin('0789 201 000', 'business', 'Tomoca Coffee Roasters')}
            >
              <span className="text-base">☕</span>
              <div className="text-left">
                <span className="font-semibold text-xs block text-white">Merchant: Tomoca Coffee</span>
                <span className="text-xs text-muted">Till 789201 • 3,500 ETB Escrow</span>
              </div>
              <span className="badge badge-xs badge-gold ml-auto">Merchant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
