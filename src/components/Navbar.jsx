import React from 'react';
import { 
  Briefcase, 
  UserCheck, 
  Zap, 
  Terminal, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Globe 
} from 'lucide-react';
import { sound } from '../utils/audio';

export function Navbar({ 
  role, 
  setRole, 
  lang, 
  setLang, 
  t, 
  worker, 
  onOpenWithdraw, 
  onTogglePhoneSim, 
  isPhoneSimOpen,
  soundEnabled,
  setSoundEnabled
}) {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playKeypadBeep();
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <span className="logo-eb">EB</span>
            <div className="logo-dot"></div>
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <h1 className="brand-name">{t.appTitle}</h1>
              <span className="safaricom-pill">
                <span className="safaricom-pulse"></span>
                SAFARICOM M-PESA
              </span>
            </div>
            <p className="brand-subtitle">{t.tagline}</p>
          </div>
        </div>

        {/* Center: Main Role Switcher */}
        <div className="role-switch-pills">
          <button 
            className={`role-pill ${role === 'worker' ? 'active' : ''}`}
            onClick={() => {
              setRole('worker');
              sound.playKeypadBeep();
            }}
          >
            <UserCheck size={16} />
            <span>{t.workerRole}</span>
          </button>

          <button 
            className={`role-pill ${role === 'business' ? 'active' : ''}`}
            onClick={() => {
              setRole('business');
              sound.playKeypadBeep();
            }}
          >
            <Briefcase size={16} />
            <span>{t.businessRole}</span>
          </button>

          <button 
            className={`role-pill demo-pill ${role === 'judge_demo' ? 'active' : ''}`}
            onClick={() => {
              setRole('judge_demo');
              sound.playMpesaTone();
            }}
          >
            <Zap size={16} className="text-gold" />
            <span className="font-bold">{t.demoTour}</span>
          </button>

          <button 
            className={`role-pill ${role === 'api_logs' ? 'active' : ''}`}
            onClick={() => {
              setRole('api_logs');
              sound.playKeypadBeep();
            }}
          >
            <Terminal size={16} />
            <span>{t.apiInspector}</span>
          </button>
        </div>

        {/* Right Controls: Wallet quick pill, Phone sim, sound, lang */}
        <div className="navbar-actions">
          {/* Quick Wallet Pill (only in worker view or anytime) */}
          <button 
            className="navbar-wallet-pill"
            onClick={onOpenWithdraw}
            title="Click to withdraw"
          >
            <span className="wallet-label">{t.availableBalance}:</span>
            <span className="wallet-value">
              {worker.walletBalanceETB.toFixed(2)} <span className="text-gold">ETB</span>
            </span>
          </button>

          {/* Interactive Phone Simulator Toggle */}
          <button 
            className={`icon-action-btn ${isPhoneSimOpen ? 'active' : ''}`}
            onClick={onTogglePhoneSim}
            title="Toggle M-Pesa Phone USSD / Push Simulator"
          >
            <Smartphone size={18} />
            <span className="btn-label-mobile">M-Pesa Phone</span>
          </button>

          {/* Sound Toggle */}
          <button 
            className="icon-action-btn"
            onClick={toggleSound}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 size={18} className="text-green" /> : <VolumeX size={18} className="text-faint" />}
          </button>

          {/* Language Selector */}
          <div className="lang-dropdown">
            <Globe size={16} className="text-muted" />
            <select 
              value={lang} 
              onChange={(e) => {
                setLang(e.target.value);
                sound.playKeypadBeep();
              }}
              className="lang-select"
            >
              <option value="en">English (EN)</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="om">Oromiffa (OM)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
