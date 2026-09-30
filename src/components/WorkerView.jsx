import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Users, 
  Award, 
  Copy, 
  Check, 
  ChevronRight, 
  Flame, 
  Info 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { sampleProofTemplates } from '../data/mockData';

export function WorkerView({ 
  worker, 
  tasks, 
  onStartTask, 
  onOpenWithdraw, 
  t 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  
  // Task execution modal states
  const [actionTimer, setActionTimer] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [selectedProofPreset, setSelectedProofPreset] = useState(sampleProofTemplates[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferralDrawer, setShowReferralDrawer] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesCat = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Handle open task
  const handleOpenTask = (task) => {
    setActiveTaskModal(task);
    setActionTimer(task.timerSeconds || 15);
    setTimerFinished(false);
    setSelectedProofPreset(sampleProofTemplates[0]);
    setUploadedFile(null);
    setWorkerNotes(sampleProofTemplates[0].text);
    sound.playKeypadBeep();
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (activeTaskModal && actionTimer > 0) {
      interval = setInterval(() => {
        setActionTimer(prev => {
          if (prev <= 1) {
            setTimerFinished(true);
            sound.playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTaskModal, actionTimer]);

  // Copy referral code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(worker.referralCode);
    setCopiedCode(true);
    sound.playSuccess();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handle submit proof
  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!timerFinished) return;

    setIsSubmitting(true);
    sound.playMpesaTone();

    setTimeout(() => {
      onStartTask({
        taskId: activeTaskModal.id,
        taskTitle: activeTaskModal.title,
        rewardETB: activeTaskModal.rewardETB,
        proofImage: uploadedFile || selectedProofPreset.url,
        proofText: workerNotes,
        aiScreening: {
          passed: selectedProofPreset.mockAiConfidence > 70,
          confidence: selectedProofPreset.mockAiConfidence,
          summary: selectedProofPreset.isDup 
            ? "Duplicate Flag: Perceptual hash matched an earlier submission." 
            : "AI verified: Legitimate interaction screenshot detected with high clarity.",
          detectedText: selectedProofPreset.text
        },
        duplicateCheck: {
          isDuplicate: selectedProofPreset.isDup,
          hash: selectedProofPreset.isDup ? "pHash-a98f12c8b7410e3d" : "pHash-" + Math.random().toString(36).substring(2, 10),
          similarityScore: selectedProofPreset.isDup ? 0.94 : 0.03,
          note: selectedProofPreset.isDup 
            ? "CRITICAL: Image matches another submission by 94%" 
            : "PASSED: Verified unique hash signature."
        }
      });

      setIsSubmitting(false);
      setActiveTaskModal(null);
    }, 900);
  };

  return (
    <div className="worker-view-container animate-fade-in">
      {/* Top Banner: Worker Trust & Level Card */}
      <div className="worker-header-card glass-card">
        <div className="worker-info-col">
          <div className="worker-avatar-wrapper">
            <span className="worker-avatar">{worker.avatar}</span>
            <div className="worker-verified-badge" title="Phone & M-Pesa Verified">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div>
            <div className="worker-name-row">
              <h2 className="worker-name">{worker.name}</h2>
              <span className={`badge ${worker.tier === 'Gold' ? 'badge-gold' : 'badge-silver'}`}>
                <Award size={12} />
                {worker.tier} {t.level}
              </span>
            </div>
            <div className="worker-meta-row">
              <span className="worker-phone">{worker.phone}</span>
              <span className="meta-dot">•</span>
              <span className="worker-network">{worker.network}</span>
              <span className="meta-dot">•</span>
              <span className="worker-tasks-stat">{worker.completedTasks} tasks done ({worker.approvedRate} approved)</span>
            </div>
          </div>
        </div>

        {/* Trust Score & Level Benefit */}
        <div className="worker-trust-col">
          <div className="trust-meter-card">
            <div className="trust-meter-circle">
              <span className="trust-meter-val">{worker.trustScore}</span>
              <span className="trust-meter-max">/100</span>
            </div>
            <div className="trust-text-block">
              <span className="trust-label">{t.trustScore}</span>
              <span className="trust-benefit">Unlocks High-ETB Tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="finance-grid">
        <div className="finance-card glass-card balance-card">
          <div className="finance-card-header">
            <span className="finance-card-title">{t.availableBalance}</span>
            <div className="card-icon-pill green">
              <Wallet size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.walletBalanceETB.toFixed(2)}</span>
              <span className="currency-symbol">ETB</span>
            </div>
            <p className="finance-subtext">Instant payout to your Safaricom M-Pesa</p>
          </div>
          <div className="finance-card-footer">
            <button 
              className="btn btn-primary btn-sm w-full"
              onClick={onOpenWithdraw}
            >
              <ArrowUpRight size={16} />
              {t.withdrawBtn}
            </button>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-card-header">
            <span className="finance-card-title">{t.inEscrow}</span>
            <div className="card-icon-pill gold">
              <Clock size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.escrowPendingETB.toFixed(2)}</span>
              <span className="currency-symbol text-gold">ETB</span>
            </div>
            <p className="finance-subtext">3 tasks currently under business review</p>
          </div>
          <div className="finance-card-footer status-footer">
            <span className="text-muted text-xs">Releases automatically upon approval</span>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-card-header">
            <span className="finance-card-title">{t.totalEarned}</span>
            <div className="card-icon-pill blue">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.lifetimeEarnedETB.toFixed(2)}</span>
              <span className="currency-symbol">ETB</span>
            </div>
            <p className="finance-subtext">Lifetime micro-earnings</p>
          </div>
          <div className="finance-card-footer status-footer">
            <button 
              className="referral-trigger-link"
              onClick={() => setShowReferralDrawer(true)}
            >
              <Users size={14} />
              <span>Referral Program ({worker.referralCount} invited)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Marketplace Header & Filter Bar */}
      <div className="marketplace-section">
        <div className="marketplace-header-row">
          <div>
            <h3 className="section-heading">{t.taskFeed}</h3>
            <p className="section-subheading">Verified tasks funded in escrow by registered businesses</p>
          </div>
          <div className="marketplace-badge-pill">
            <Flame size={15} className="text-gold" />
            <span>Escrow Guaranteed • Zero Scam Risk</span>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="filters-bar glass-card">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder={t.searchTasks}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-pills-row">
            <button 
              className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('all'); sound.playKeypadBeep(); }}
            >
              {t.allCategories}
            </button>
            <button 
              className={`cat-pill ${selectedCategory === 'appReview' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('appReview'); sound.playKeypadBeep(); }}
            >
              ⭐ {t.appReview}
            </button>
            <button 
              className={`cat-pill ${selectedCategory === 'testing' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('testing'); sound.playKeypadBeep(); }}
            >
              📱 {t.testing}
            </button>
            <button 
              className={`cat-pill ${selectedCategory === 'surveys' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('surveys'); sound.playKeypadBeep(); }}
            >
              📋 {t.surveys}
            </button>
            <button 
              className={`cat-pill ${selectedCategory === 'social' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('social'); sound.playKeypadBeep(); }}
            >
              📢 {t.social}
            </button>
            <button 
              className={`cat-pill ${selectedCategory === 'localData' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('localData'); sound.playKeypadBeep(); }}
            >
              📍 {t.localData}
            </button>
          </div>
        </div>

        {/* Tasks List Grid */}
        <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-tasks-card glass-card">
              <AlertCircle size={32} className="text-muted mb-2" />
              <p>No micro-tasks found matching your filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const progressPct = Math.round((task.completedSlots / task.totalSlots) * 100);
              const isLockedByTier = task.minTier === 'Gold' && worker.tier !== 'Gold';

              return (
                <div key={task.id} className={`task-card glass-card ${isLockedByTier ? 'tier-locked' : ''}`}>
                  <div className="task-card-top">
                    <div className="business-info">
                      <span className="business-logo">{task.businessLogo}</span>
                      <div>
                        <span className="business-name">{task.businessName}</span>
                        <div className="task-tier-indicator">
                          <span className={`badge badge-sm ${task.minTier === 'Gold' ? 'badge-gold' : 'badge-green'}`}>
                            {task.minTier} Tier
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reward Pill */}
                    <div className="task-reward-box">
                      <span className="reward-label">{t.reward}</span>
                      <span className="reward-value">
                        {task.rewardETB.toFixed(1)} <span className="currency-etb">ETB</span>
                      </span>
                    </div>
                  </div>

                  <h4 className="task-title">{task.title}</h4>
                  <p className="task-description">{task.description}</p>

                  {/* Slots Progress */}
                  <div className="task-slots-section">
                    <div className="slots-labels">
                      <span className="slots-text">
                        <strong>{task.totalSlots - task.completedSlots}</strong> {t.slotsLeft}
                      </span>
                      <span className="slots-pct">{progressPct}% filled</span>
                    </div>
                    <div className="slots-progress-bar">
                      <div className="slots-progress-fill" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="task-card-footer">
                    <span className="timer-badge" title="Anti-bot timer protection">
                      <Clock size={13} />
                      {task.timerSeconds}s action timer
                    </span>

                    {isLockedByTier ? (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Unlock at Gold Tier
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenTask(task)}
                      >
                        {t.startTask}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Execution & Proof Submission Modal */}
      {activeTaskModal && (
        <div className="modal-backdrop" onClick={() => setActiveTaskModal(null)}>
          <div className="modal-content glass-card task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-info">
                <span className="badge badge-green mb-1">Active Micro-Task</span>
                <h3 className="modal-task-title">{activeTaskModal.title}</h3>
                <span className="modal-business-sub">Posted by {activeTaskModal.businessName}</span>
              </div>
              <div className="modal-reward-badge">
                <span className="reward-tag">Reward</span>
                <span className="reward-val">{activeTaskModal.rewardETB.toFixed(2)} ETB</span>
              </div>
            </div>

            <div className="modal-body">
              {/* Target Action Link */}
              {activeTaskModal.targetUrl && activeTaskModal.targetUrl !== '#' && (
                <div className="target-link-box">
                  <span className="target-box-title">Required Step 1: Open Target URL</span>
                  <a 
                    href={activeTaskModal.targetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-secondary btn-sm"
                  >
                    Open Target Link / App
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Step by step checklist */}
              <div className="modal-checklist">
                <h5 className="checklist-heading">Verification Guidelines:</h5>
                <ul className="guidelines-list">
                  {activeTaskModal.guidelines.map((guide, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={15} className="text-green flex-shrink-0" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Anti-bot Action Timer */}
              <div className={`action-timer-box ${timerFinished ? 'timer-ready' : 'timer-counting'}`}>
                <div className="timer-icon-col">
                  <Clock size={20} className={timerFinished ? 'text-green' : 'text-gold'} />
                </div>
                <div className="timer-text-col">
                  {timerFinished ? (
                    <div>
                      <strong className="text-green">Action Timer Completed!</strong>
                      <p className="text-xs text-muted">Proof submission unlocked. Submit your genuine screenshot below.</p>
                    </div>
                  ) : (
                    <div>
                      <strong className="text-gold">{t.actionTimer} {actionTimer}s</strong>
                      <p className="text-xs text-muted">Prevents bots & guarantees tasks are performed legitimately before upload unlocks.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof Selection Form */}
              <form onSubmit={handleSubmitProof} className="proof-form">
                <div className="form-group">
                  <label className="form-label">{t.uploadScreenshot}</label>
                  
                  {/* Preset Proof Quick Picker (For demo convenience) */}
                  <div className="preset-picker-label">
                    <span>⚡ Quick Test Proof Presets (for instant Hackathon testing):</span>
                  </div>
                  <div className="proof-presets-grid">
                    {sampleProofTemplates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        className={`preset-proof-btn ${selectedProofPreset.id === tmpl.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedProofPreset(tmpl);
                          setWorkerNotes(tmpl.text);
                          sound.playKeypadBeep();
                        }}
                      >
                        <div className="preset-btn-top">
                          <span className="preset-btn-name">{tmpl.name}</span>
                          {tmpl.isDup ? (
                            <span className="badge badge-red badge-sm">Dup Test</span>
                          ) : (
                            <span className="badge badge-green badge-sm">Valid</span>
                          )}
                        </div>
                        <span className="preset-btn-desc">{tmpl.description}</span>
                      </button>
                    ))}
                  </div>

                  {/* Proof Image Preview with AI Pre-check HUD */}
                  <div className="proof-preview-container">
                    <img 
                      src={uploadedFile || selectedProofPreset.url} 
                      alt="Proof Preview" 
                      className="proof-img-preview"
                    />
                    
                    {/* Live AI Pre-Check Overlay */}
                    <div className="ai-precheck-badge-card">
                      <div className="ai-precheck-row">
                        <Sparkles size={14} className="text-green" />
                        <span className="ai-precheck-title">Live AI Screening:</span>
                        <span className={`ai-score ${selectedProofPreset.mockAiConfidence > 70 ? 'text-green' : 'text-danger'}`}>
                          {selectedProofPreset.mockAiConfidence}% Match
                        </span>
                      </div>
                      <div className="ai-precheck-row">
                        <ShieldCheck size={14} className={selectedProofPreset.isDup ? 'text-danger' : 'text-green'} />
                        <span className="ai-precheck-title">Duplicate Hash:</span>
                        <span className={selectedProofPreset.isDup ? 'text-danger' : 'text-green'}>
                          {selectedProofPreset.isDup ? 'FLAGGED (MATCH FOUND)' : 'UNIQUE (PASSED)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker notes */}
                <div className="form-group">
                  <label className="form-label">Worker Comments / Review Link:</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    placeholder="E.g., Posted review under username 'KidusG' with photo"
                    required
                  ></textarea>
                </div>

                {/* Modal Buttons */}
                <div className="modal-actions-row">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setActiveTaskModal(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!timerFinished || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : t.submitProof}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Referral Program Drawer / Modal */}
      {showReferralDrawer && (
        <div className="modal-backdrop" onClick={() => setShowReferralDrawer(false)}>
          <div className="modal-content glass-card referral-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-gold mb-1">Zero-Pyramid Guarantee</span>
                <h3>{t.referralProgram}</h3>
              </div>
              <button className="btn-close" onClick={() => setShowReferralDrawer(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="referral-rule-box">
                <Info size={18} className="text-gold flex-shrink-0" />
                <p className="text-sm">{t.referralNotice}</p>
              </div>

              <div className="referral-code-block">
                <label className="form-label">{t.myReferralCode}</label>
                <div className="referral-input-group">
                  <input 
                    type="text" 
                    readOnly 
                    value={worker.referralCode}
                    className="referral-code-input"
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCode ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="referral-stats-grid">
                <div className="ref-stat-box">
                  <span className="ref-stat-val">{worker.referralCount}</span>
                  <span className="ref-stat-lbl">Friends Invited</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-val text-green">{worker.referralUnlockedETB.toFixed(2)} ETB</span>
                  <span className="ref-stat-lbl">Bonus Released</span>
                </div>
              </div>

              <div className="referral-friends-list">
                <h5 className="mb-2 text-sm font-semibold">Your Invited Friends:</h5>
                <div className="friend-row">
                  <span>Abebe K. (0781 *** 12)</span>
                  <span className="badge badge-green badge-sm">1 Task Approved (+15 ETB Released)</span>
                </div>
                <div className="friend-row">
                  <span>Bethlehem T. (0719 *** 44)</span>
                  <span className="badge badge-green badge-sm">1 Task Approved (+15 ETB Released)</span>
                </div>
                <div className="friend-row">
                  <span>Natnael S. (0722 *** 89)</span>
                  <span className="badge badge-silver badge-sm">Signed Up (Task Pending)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
