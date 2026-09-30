import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wifi, 
  Battery, 
  MessageSquare, 
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

export function MpesaSimulator({ 
  isOpen, 
  onClose, 
  activePrompt, // { type: 'STK_PUSH' | 'B2C_NOTIF', amount, title, tillNumber, phone, callback }
  onResolvePrompt 
}) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' | 'sms'
  const [recentSmsList, setRecentSmsList] = useState([
    {
      id: "sms-1",
      sender: "M-PESA",
      time: "Just now",
      body: "SDF91KA49X Confirmed. ETB 3,500.00 deposited into Ethio Bucks Escrow Account 789201 on 30/09/2026. Safaricom M-Pesa."
    }
  ]);

  // Adjust state during render when activePrompt changes
  const [prevPrompt, setPrevPrompt] = useState(activePrompt);
  if (activePrompt !== prevPrompt) {
    setPrevPrompt(activePrompt);
    if (activePrompt) {
      setPin('');
      setPinError('');
      setIsProcessing(false);
    }
  }

  // Audio tone side-effect
  useEffect(() => {
    if (activePrompt?.type === 'STK_PUSH') {
      sound.playMpesaTone();
    }
  }, [activePrompt]);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      sound.playKeypadBeep();
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    sound.playKeypadBeep();
  };

  const handleConfirmPin = () => {
    if (pin.length !== 4) {
      setPinError('Enter a 4-digit PIN');
      return;
    }

    setIsProcessing(true);
    sound.playMpesaTone();

    setTimeout(() => {
      setIsProcessing(false);
      sound.playSuccess();
      
      // Add SMS record
      if (activePrompt) {
        const receiptCode = "SDF" + Math.floor(100000 + Math.random() * 900000);
        const newSms = {
          id: "sms-" + Date.now(),
          sender: "M-PESA",
          time: "Just now",
          body: `${receiptCode} Confirmed. ETB ${activePrompt.amount?.toFixed(2) || '150.00'} ${activePrompt.type === 'STK_PUSH' ? 'paid to Ethio Bucks Escrow (Till ' + (activePrompt.tillNumber || '789201') + ')' : 'received from Ethio Bucks Escrow'}. New balance ETB 2,490.50.`
        };
        setRecentSmsList(prev => [newSms, ...prev]);
        
        if (onResolvePrompt) {
          onResolvePrompt(true, receiptCode);
        }
      }
    }, 1200);
  };

  const handleCancel = () => {
    if (onResolvePrompt) {
      onResolvePrompt(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="phone-sim-drawer-backdrop" onClick={onClose}>
      <div className="phone-sim-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Phone Case Frame */}
        <div className="phone-device-bezel">
          {/* Top Speaker & Camera Notch */}
          <div className="phone-notch">
            <div className="phone-camera-lens"></div>
            <div className="phone-speaker-grill"></div>
          </div>

          {/* Status Bar */}
          <div className="phone-status-bar">
            <span className="phone-time">08:52</span>
            <span className="phone-carrier">Safaricom ET</span>
            <div className="phone-status-icons">
              <span className="network-speed-badge">5G</span>
              <Wifi size={13} />
              <Battery size={13} />
            </div>
          </div>

          {/* Phone Display Screen */}
          <div className="phone-screen-content">
            {/* View Switcher: USSD / STK vs Messages */}
            <div className="phone-nav-mini">
              <button 
                className={`phone-tab ${activeTab === 'phone' ? 'active' : ''}`}
                onClick={() => setActiveTab('phone')}
              >
                STK Prompt
              </button>
              <button 
                className={`phone-tab ${activeTab === 'sms' ? 'active' : ''}`}
                onClick={() => setActiveTab('sms')}
              >
                SMS Inbox ({recentSmsList.length})
              </button>
              <button className="phone-close-btn" onClick={onClose} title="Close Phone">
                <X size={15} />
              </button>
            </div>

            {/* TAB: USSD / STK PUSH POPUP */}
            {activeTab === 'phone' && (
              <div className="phone-inner-view">
                {activePrompt ? (
                  <div className="stk-push-dialog animate-fade-in">
                    <div className="stk-dialog-header">
                      <div className="mpesa-green-circle">
                        <span>M</span>
                      </div>
                      <div>
                        <h4 className="stk-dialog-title">Safaricom M-PESA</h4>
                        <span className="stk-dialog-sub">SIM Toolkit Push Request</span>
                      </div>
                    </div>

                    <div className="stk-dialog-body">
                      {activePrompt.type === 'STK_PUSH' ? (
                        <p className="stk-prompt-text">
                          Do you want to deposit <strong>ETB {activePrompt.amount?.toFixed(2)}</strong> to <strong>Ethio Bucks Escrow</strong> (Till: {activePrompt.tillNumber || '789201'})?
                        </p>
                      ) : (
                        <p className="stk-prompt-text">
                          Confirm B2C payout withdrawal of <strong>ETB {activePrompt.amount?.toFixed(2)}</strong> to your Safaricom M-Pesa account?
                        </p>
                      )}

                      <div className="pin-input-display">
                        <label className="text-xs text-muted block mb-1">Enter 4-Digit M-PESA PIN:</label>
                        <div className="pin-dots-row">
                          {[0, 1, 2, 3].map((idx) => (
                            <div 
                              key={idx} 
                              className={`pin-dot ${pin.length > idx ? 'filled' : ''}`}
                            ></div>
                          ))}
                        </div>
                        {pinError && <span className="pin-error-msg">{pinError}</span>}
                      </div>

                      {/* Interactive Keypad */}
                      <div className="phone-keypad-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                          <button
                            key={digit}
                            type="button"
                            className="keypad-btn"
                            onClick={() => handleKeyPress(digit)}
                            disabled={isProcessing}
                          >
                            {digit}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="keypad-btn text-xs text-muted"
                          onClick={handleBackspace}
                          disabled={isProcessing}
                        >
                          ⌫
                        </button>
                        <button
                          type="button"
                          className="keypad-btn"
                          onClick={() => handleKeyPress(0)}
                          disabled={isProcessing}
                        >
                          0
                        </button>
                        <button
                          type="button"
                          className="keypad-btn btn-send-dial"
                          onClick={handleConfirmPin}
                          disabled={isProcessing || pin.length !== 4}
                        >
                          ✓
                        </button>
                      </div>

                      {/* STK Push Action Buttons */}
                      <div className="stk-action-btns">
                        <button 
                          className="btn btn-secondary btn-sm flex-1"
                          onClick={handleCancel}
                          disabled={isProcessing}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex-1"
                          onClick={handleConfirmPin}
                          disabled={isProcessing || pin.length !== 4}
                        >
                          {isProcessing ? "Authorizing..." : "Authorize M-Pesa"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="phone-idle-screen">
                    <div className="mpesa-hero-logo">
                      <div className="mpesa-logo-circle">M</div>
                      <h4 className="mt-2 font-bold text-main">Safaricom M-PESA</h4>
                      <span className="badge badge-green mt-1">Live Sandbox Ready</span>
                    </div>

                    <div className="phone-idle-instruction">
                      <ShieldCheck size={28} className="text-green mx-auto mb-2" />
                      <p className="text-sm font-semibold">Simulator Waiting for Triggers</p>
                      <p className="text-xs text-muted mt-1">
                        Trigger an STK Push by funding a business task, or initiate a B2C withdrawal to view instant phone prompts here.
                      </p>
                    </div>

                    <div className="quick-test-actions mt-4">
                      <button 
                        className="btn btn-secondary btn-sm w-full"
                        onClick={() => {
                          const newSms = {
                            id: "sms-" + Date.now(),
                            sender: "M-PESA",
                            time: "Just now",
                            body: "SDF88123X Confirmed. ETB 100.00 received from Ethio Bucks escrow. Safaricom Ethiopia."
                          };
                          setRecentSmsList(prev => [newSms, ...prev]);
                          setActiveTab('sms');
                          sound.playMpesaTone();
                        }}
                      >
                        <MessageSquare size={14} />
                        Simulate Test M-Pesa SMS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SMS MESSAGES */}
            {activeTab === 'sms' && (
              <div className="phone-sms-view animate-fade-in">
                <div className="sms-list-header">
                  <h5 className="font-semibold text-sm">Official Safaricom M-Pesa Alerts</h5>
                </div>
                <div className="sms-bubble-list">
                  {recentSmsList.map((sms) => (
                    <div key={sms.id} className="sms-message-bubble">
                      <div className="sms-meta-row">
                        <span className="sms-sender">{sms.sender}</span>
                        <span className="sms-timestamp">{sms.time}</span>
                      </div>
                      <p className="sms-body-text">{sms.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="phone-home-indicator"></div>
        </div>
      </div>
    </div>
  );
}
