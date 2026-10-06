import React from 'react';
import { 
  Briefcase, 
  UserCheck, 
  Terminal, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Globe,
  LogOut,
  Wallet
} from 'lucide-react';
import { sound } from '../utils/audio';

export function Navbar({ 
  user,
  wallet,
  role, 
  setRole, 
  lang, 
  setLang, 
  t, 
  onOpenWithdraw, 
  onTogglePhoneSim, 
  isPhoneSimOpen,
  soundEnabled,
  setSoundEnabled,
  onLogout
}) {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playKeypadBeep();
  };

  const currentBalance = (wallet?.walletBalanceETB ?? 0);

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
              <h1 className="brand-name">{t?.appTitle || "Ethio Bucks"}</h1>
              <span className="safaricom-pill">
                <span className="safaricom-pulse"></span>
                SAFARICOM M-PESA
              </span>
            </div>
            <p className="brand-subtitle">{t?.tagline || "Micro-Tasks Marketplace on Safaricom M-Pesa"}</p>
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
            <span>{t?.workerRole || "Worker Portal"}</span>
          </button>

          <button 
            className={`role-pill ${role === 'business' ? 'active' : ''}`}
            onClick={() => {
              setRole('business');
              sound.playKeypadBeep();
            }}
          >
            <Briefcase size={16} />
            <span>{t?.businessRole || "Business Portal"}</span>
          </button>

          <button 
            className={`role-pill ${role === 'api_logs' ? 'active' : ''}`}
            onClick={() => {
              setRole('api_logs');
              sound.playKeypadBeep();
            }}
          >
            <Terminal size={16} />
            <span>{t?.apiInspector || "M-Pesa API Logs"}</span>
          </button>
        </div>

        {/* Right Controls: Wallet quick pill, Phone sim, sound, lang, user */}
        <div className="navbar-actions">
          {/* Quick Wallet Pill (if worker) */}
          {role === 'worker' && (
            <button 
              className="navbar-wallet-pill"
              onClick={onOpenWithdraw}
              title="Click to withdraw"
            >
              <Wallet size={14} className="text-green" />
              <span className="wallet-value">
                {currentBalance.toFixed(2)} <span className="text-gold">ETB</span>
              </span>
            </button>
          )}

          {/* Interactive Phone Simulator Toggle */}
          <button 
            className={`icon-action-btn ${isPhoneSimOpen ? 'active' : ''}`}
            onClick={onTogglePhoneSim}
            title="Toggle Safaricom M-Pesa Phone & SMS Inbox"
          >
            <Smartphone size={18} />
            <span className="btn-label-mobile">{t?.phoneSim || "M-Pesa Phone"}</span>
          </button>

          {/* Sound Toggle */}
          <button 
            className="icon-action-btn"
            onClick={toggleSound}
            title={soundEnabled ? (t?.mute || "Mute sounds") : (t?.unmute || "Enable sounds")}
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

          {/* User Profile Badge & Logout */}
          {user && (
            <div className="user-profile-nav-wrap flex items-center gap-2">
              <span className="user-nav-avatar" title={user.name}>{user.avatar || '👤'}</span>
              <button 
                className="icon-action-btn text-danger hover:bg-red-500/10" 
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
