import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  Briefcase,
  FileText,
  Upload,
  Image as ImageIcon,
  XCircle,
  Eye,
  CheckCircle,
  TrendingUp,
  Smartphone,
  Zap,
  Filter
} from 'lucide-react';
import { sound } from '../utils/audio';
import { sampleProofTemplates } from '../data/mockData';

export function WorkerView({ 
  worker, 
  tasks = [], 
  submissions = [],
  onStartTask, 
  onOpenWithdraw, 
  onOpenPhoneSim,
  logs = [],
  t 
}) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'submissions' | 'wallet' | 'referrals'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null);
  
  // Task execution modal states
  const [actionTimer, setActionTimer] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [selectedProofPreset, setSelectedProofPreset] = useState(sampleProofTemplates[0]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferralDrawer, setShowReferralDrawer] = useState(false);

  const fileInputRef = useRef(null);

  // Submissions for this specific worker
  const workerSubmissions = submissions.filter(
    s => s.workerId === worker.id || s.workerName === worker.name
  );
  const pendingSubmissions = workerSubmissions.filter(s => s.status === 'pending');
  const approvedSubmissions = workerSubmissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = workerSubmissions.filter(s => s.status === 'rejected');
  const submittedTaskIds = new Set(workerSubmissions.map(s => s.taskId));

  // Filter available tasks
  const filteredTasks = tasks.filter(task => {
    const matchesCat = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter worker submissions
  const filteredSubmissions = workerSubmissions.filter(sub => {
    if (submissionFilter === 'all') return true;
    return sub.status === submissionFilter;
  });

  // B2C cashout & escrow payout logs
  const workerLogs = logs.filter(
    l => l.type === 'B2C_CALLBACK' || l.type === 'ESCROW_RELEASE_CREDIT' || l.type === 'B2C_PAYOUT_REQUEST'
  );

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

  // Fast forward / skip timer for testing/demo
  const handleSkipTimer = () => {
    setActionTimer(0);
    setTimerFinished(true);
    sound.playSuccess();
  };

  // Handle custom image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUploadedFile(dataUrl);
        setSelectedProofPreset({
          id: "custom-" + Date.now(),
          name: file.name,
          url: dataUrl,
          description: `Custom image upload (${(file.size / 1024).toFixed(1)} KB)`,
          mockAiConfidence: 96,
          isDup: false,
          text: `Verified upload: ${file.name}`
        });
        sound.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear custom upload
  const handleClearUpload = () => {
    setUploadedFile(null);
    setSelectedProofPreset(sampleProofTemplates[0]);
    setWorkerNotes(sampleProofTemplates[0].text);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sound.playKeypadBeep();
  };

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
      // Auto navigate to submissions tab to immediately see the new item under review
      setActiveTab('submissions');
      setSubmissionFilter('all');
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
                {worker.tier} {t?.level || "Tier"}
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
              <span className="trust-label">{t?.trustScore || "Trust Score"}</span>
              <span className="trust-benefit">{t?.unlocksHighEtb || "Unlocks High-ETB Tasks"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="finance-grid">
        <div className="finance-card glass-card balance-card">
          <div className="finance-card-header">
            <span className="finance-card-title">{t?.availableBalance || "Available Balance"}</span>
            <div className="card-icon-pill green">
              <Wallet size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.walletBalanceETB.toFixed(2)}</span>
              <span className="currency-symbol">ETB</span>
            </div>
            <p className="finance-subtext">{t?.instantPayoutDesc || "Instant payout to your Safaricom M-Pesa"}</p>
          </div>
          <div className="finance-card-footer">
            <button 
              className="btn btn-primary btn-sm w-full"
              onClick={onOpenWithdraw}
            >
              <ArrowUpRight size={16} />
              {t?.withdrawBtn || "Withdraw to M-Pesa"}
            </button>
          </div>
        </div>

        <div 
          className="finance-card glass-card cursor-pointer hover:border-gold transition-all"
          onClick={() => { setActiveTab('submissions'); setSubmissionFilter('pending'); sound.playKeypadBeep(); }}
          title="Click to view tasks pending review"
        >
          <div className="finance-card-header">
            <span className="finance-card-title">{t?.inEscrow || "Held in Escrow"}</span>
            <div className="card-icon-pill gold">
              <Clock size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.escrowPendingETB.toFixed(2)}</span>
              <span className="currency-symbol text-gold">ETB</span>
            </div>
            <p className="finance-subtext">
              {pendingSubmissions.length > 0 
                ? `${pendingSubmissions.length} ${t?.underReviewDesc || "tasks currently under business review"}`
                : (t?.autoReleaseDesc || "Releases automatically upon approval")}
            </p>
          </div>
          <div className="finance-card-footer status-footer flex justify-between items-center">
            <span className="text-muted text-xs">{t?.autoReleaseDesc || "Releases automatically upon approval"}</span>
            <ChevronRight size={14} className="text-gold" />
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-card-header">
            <span className="finance-card-title">{t?.totalEarned || "Total Earned"}</span>
            <div className="card-icon-pill blue">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="finance-card-body">
            <div className="finance-amount">
              <span className="amount-number">{worker.lifetimeEarnedETB.toFixed(2)}</span>
              <span className="currency-symbol">ETB</span>
            </div>
            <p className="finance-subtext">{t?.lifetimeEarningsDesc || "Lifetime micro-earnings"}</p>
          </div>
          <div className="finance-card-footer status-footer">
            <button 
              className="referral-trigger-link"
              onClick={() => { setActiveTab('referrals'); sound.playKeypadBeep(); }}
            >
              <Users size={14} />
              <span>{t?.referralTrigger || "Referral Program"} ({worker.referralCount} {t?.invited || "invited"})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="worker-nav-tabs glass-card">
        <button 
          className={`worker-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => { setActiveTab('browse'); sound.playKeypadBeep(); }}
        >
          <Briefcase size={16} />
          <span>{t?.browseTasks || "Browse Micro-Tasks"}</span>
          <span className="tab-pill-counter">{filteredTasks.length}</span>
        </button>

        <button 
          className={`worker-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => { setActiveTab('submissions'); sound.playKeypadBeep(); }}
        >
          <FileText size={16} />
          <span>{t?.mySubmissions || "My Submissions"}</span>
          {pendingSubmissions.length > 0 ? (
            <span className="tab-pill-counter pending-pill">{pendingSubmissions.length}</span>
          ) : (
            <span className="tab-pill-counter">{workerSubmissions.length}</span>
          )}
        </button>

        <button 
          className={`worker-tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wallet'); sound.playKeypadBeep(); }}
        >
          <Wallet size={16} />
          <span>{t?.walletAndPayouts || "Wallet & Cash-Out"}</span>
        </button>

        <button 
          className={`worker-tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => { setActiveTab('referrals'); sound.playKeypadBeep(); }}
        >
          <Users size={16} />
          <span>{t?.referralProgram || "Referral Program"}</span>
          <span className="tab-pill-counter gold-pill">{worker.referralCount}</span>
        </button>
      </div>

      {/* TAB 1: BROWSE MICRO-TASKS MARKETPLACE */}
      {activeTab === 'browse' && (
        <div className="marketplace-section animate-fade-in">
          <div className="marketplace-header-row">
            <div>
              <h3 className="section-heading">{t?.taskFeed || "Available Micro-Tasks"}</h3>
              <p className="section-subheading">Verified tasks funded in escrow by registered businesses</p>
            </div>
            <div className="marketplace-badge-pill">
              <Flame size={15} className="text-gold" />
              <span>{t?.escrowGuaranteed || "Escrow Guaranteed • Zero Scam Risk"}</span>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="filters-bar glass-card">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text"
                placeholder={t?.searchTasks || "Search tasks..."}
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
                {t?.allCategories || "All Tasks"}
              </button>
              <button 
                className={`cat-pill ${selectedCategory === 'appReview' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('appReview'); sound.playKeypadBeep(); }}
              >
                ⭐ {t?.appReview || "App & Maps Reviews"}
              </button>
              <button 
                className={`cat-pill ${selectedCategory === 'testing' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('testing'); sound.playKeypadBeep(); }}
              >
                📱 {t?.testing || "App Testing"}
              </button>
              <button 
                className={`cat-pill ${selectedCategory === 'surveys' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('surveys'); sound.playKeypadBeep(); }}
              >
                📋 {t?.surveys || "Surveys & Feedback"}
              </button>
              <button 
                className={`cat-pill ${selectedCategory === 'social' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('social'); sound.playKeypadBeep(); }}
              >
                📢 {t?.social || "Social Engagement"}
              </button>
              <button 
                className={`cat-pill ${selectedCategory === 'localData' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory('localData'); sound.playKeypadBeep(); }}
              >
                📍 {t?.localData || "Local Data Collection"}
              </button>
            </div>
          </div>

          {/* Tasks List Grid */}
          <div className="tasks-grid">
            {filteredTasks.length === 0 ? (
              <div className="empty-tasks-card glass-card">
                <AlertCircle size={32} className="text-muted mb-2" />
                <p>{t?.noTasksFound || "No micro-tasks found matching your filter."}</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const progressPct = Math.round((task.completedSlots / task.totalSlots) * 100);
                const isLockedByTier = task.minTier === 'Gold' && worker.tier !== 'Gold';
                const alreadySubmitted = submittedTaskIds.has(task.id);
                const mySubmissionForTask = workerSubmissions.find(s => s.taskId === task.id);

                return (
                  <div key={task.id} className={`task-card glass-card ${isLockedByTier ? 'tier-locked' : ''}`}>
                    <div className="task-card-top">
                      <div className="business-info">
                        <span className="business-logo">{task.businessLogo}</span>
                        <div>
                          <span className="business-name">{task.businessName}</span>
                          <div className="task-tier-indicator flex items-center gap-1">
                            <span className={`badge badge-sm ${task.minTier === 'Gold' ? 'badge-gold' : 'badge-green'}`}>
                              {task.minTier} {t?.level || "Tier"}
                            </span>
                            {alreadySubmitted && (
                              <span className="badge badge-sm badge-gold">
                                ✓ {t?.submittedBadge || "Submitted"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Reward Pill */}
                      <div className="task-reward-box">
                        <span className="reward-label">{t?.reward || "Reward"}</span>
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
                          <strong>{task.totalSlots - task.completedSlots}</strong> {t?.slotsLeft || "slots left"}
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
                        {task.timerSeconds}s {t?.actionTimerBadge || "action timer"}
                      </span>

                      {alreadySubmitted ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (mySubmissionForTask) {
                              setViewProofModal(mySubmissionForTask);
                            } else {
                              setActiveTab('submissions');
                            }
                            sound.playKeypadBeep();
                          }}
                        >
                          <CheckCircle2 size={15} className="text-gold" />
                          <span>{t?.viewSubmission || "View Submission"}</span>
                        </button>
                      ) : isLockedByTier ? (
                        <button className="btn btn-secondary btn-sm opacity-70 cursor-not-allowed" disabled>
                          {t?.tierLocked || "Unlock at Gold Tier"}
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenTask(task)}
                        >
                          {t?.startTask || "Start Task"}
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
      )}

      {/* TAB 2: MY SUBMISSIONS & TRACKER */}
      {activeTab === 'submissions' && (
        <div className="worker-submissions-section animate-fade-in">
          <div className="marketplace-header-row">
            <div>
              <h3 className="section-heading">{t?.mySubmissions || "My Submissions"}</h3>
              <p className="section-subheading">Track your pending verification, approvals, and M-Pesa release status</p>
            </div>
            <div className="escrow-status-summary-badge">
              <Clock size={15} className="text-gold" />
              <span>{pendingSubmissions.length} Pending Escrow ({worker.escrowPendingETB.toFixed(2)} ETB)</span>
            </div>
          </div>

          {/* Submissions Filter Tabs */}
          <div className="submissions-filter-row glass-card">
            <button 
              className={`cat-pill ${submissionFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setSubmissionFilter('all'); sound.playKeypadBeep(); }}
            >
              {t?.allStatus || "All"} ({workerSubmissions.length})
            </button>
            <button 
              className={`cat-pill ${submissionFilter === 'pending' ? 'active' : ''}`}
              onClick={() => { setSubmissionFilter('pending'); sound.playKeypadBeep(); }}
            >
              ⏳ {t?.pendingReview || "Pending Review"} ({pendingSubmissions.length})
            </button>
            <button 
              className={`cat-pill ${submissionFilter === 'approved' ? 'active' : ''}`}
              onClick={() => { setSubmissionFilter('approved'); sound.playKeypadBeep(); }}
            >
              ✅ {t?.approvedPaid || "Approved & Paid"} ({approvedSubmissions.length})
            </button>
            <button 
              className={`cat-pill ${submissionFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => { setSubmissionFilter('rejected'); sound.playKeypadBeep(); }}
            >
              ❌ {t?.rejected || "Rejected"} ({rejectedSubmissions.length})
            </button>
          </div>

          {/* Submissions Grid */}
          <div className="worker-submissions-grid">
            {filteredSubmissions.length === 0 ? (
              <div className="empty-submissions-card glass-card text-center p-8">
                <FileText size={42} className="text-muted mx-auto mb-3" />
                <h4 className="font-semibold text-lg">{t?.noSubmissionsYet || "No task submissions found."}</h4>
                <p className="text-sm text-muted mb-4">{t?.noSubmissionsDesc || "Browse available micro-tasks and start completing tasks to earn M-Pesa payouts!"}</p>
                <button 
                  className="btn btn-primary btn-sm mx-auto"
                  onClick={() => { setActiveTab('browse'); sound.playKeypadBeep(); }}
                >
                  <Briefcase size={16} />
                  <span>{t?.browseTasks || "Browse Micro-Tasks"}</span>
                </button>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div key={sub.id} className="submission-card glass-card">
                    <div className="submission-card-header">
                      <div className="sub-title-col">
                        <span className="sub-task-id">{sub.id}</span>
                        <h4 className="sub-task-title">{sub.taskTitle}</h4>
                        <span className="sub-date text-xs text-muted">
                          {t?.submittedOn || "Submitted:"} {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="sub-reward-col text-right">
                        <span className="reward-tag">{t?.reward || "Reward"}</span>
                        <span className="reward-val font-bold text-green text-lg">
                          {sub.rewardETB.toFixed(2)} ETB
                        </span>
                        <div className="mt-1">
                          {isPending && (
                            <span className="badge badge-gold badge-sm flex items-center gap-1">
                              <Clock size={12} />
                              {t?.pendingReview || "Pending Review"}
                            </span>
                          )}
                          {isApproved && (
                            <span className="badge badge-green badge-sm flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              {t?.approvedPaid || "Approved & Paid"}
                            </span>
                          )}
                          {isRejected && (
                            <span className="badge badge-red badge-sm flex items-center gap-1">
                              <XCircle size={12} />
                              {t?.rejected || "Rejected"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="submission-card-body">
                      {/* Thumbnail & Quick Proof Info */}
                      <div className="submission-proof-row">
                        <div className="proof-thumbnail-box" onClick={() => setViewProofModal(sub)}>
                          <img src={sub.proofImage} alt="Submitted Proof" className="proof-thumbnail" />
                          <div className="proof-overlay-hover">
                            <Eye size={16} />
                            <span className="text-xs">Enlarge</span>
                          </div>
                        </div>

                        <div className="submission-proof-details">
                          <div className="proof-note-bubble">
                            <span className="text-xs text-muted block mb-1 font-semibold">{t?.workerCommentsLabel || "Worker Comment:"}</span>
                            <p className="text-sm italic text-slate-200">"{sub.proofText}"</p>
                          </div>

                          {/* AI Screening Mini Tags */}
                          <div className="submission-ai-tags">
                            <span className={`ai-mini-tag ${sub.aiScreening?.passed ? 'tag-green' : 'tag-gold'}`}>
                              <Sparkles size={12} />
                              AI Match: {sub.aiScreening?.confidence || 95}%
                            </span>
                            <span className={`ai-mini-tag ${sub.duplicateCheck?.isDuplicate ? 'tag-red' : 'tag-green'}`}>
                              <ShieldCheck size={12} />
                              {sub.duplicateCheck?.isDuplicate ? 'Duplicate Flagged' : 'Unique Hash Verified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Notification Banners */}
                      {isPending && (
                        <div className="sub-status-alert pending-alert">
                          <Clock size={16} className="text-gold flex-shrink-0" />
                          <div className="text-xs">
                            <strong>{t?.underReviewEscrowBadge || "Guaranteed in Escrow"}:</strong> {sub.rewardETB.toFixed(2)} ETB is secured in the merchant's Safaricom Till escrow. Upon business approval, funds deposit immediately into your wallet.
                          </div>
                        </div>
                      )}

                      {isApproved && (
                        <div className="sub-status-alert approved-alert">
                          <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                          <div className="text-xs">
                            <strong>{t?.approvedPaidBadge || "Paid into Wallet"}:</strong> {sub.rewardETB.toFixed(2)} ETB released and credited to your available balance. Ready for instant M-Pesa cash-out!
                            {sub.mpesaReceipt && (
                              <span className="block mt-0.5 font-mono text-green">Receipt: {sub.mpesaReceipt}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {isRejected && (
                        <div className="sub-status-alert rejected-alert">
                          <AlertCircle size={16} className="text-danger flex-shrink-0" />
                          <div className="text-xs">
                            <strong>{t?.rejectionReason || "Rejection Reason"}:</strong> {sub.rejectionReason || "Proof did not meet guidelines. Retake screenshot according to instructions."}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="submission-card-footer flex justify-between items-center">
                      <span className="text-xs text-muted">Worker: {sub.workerName} ({sub.workerPhone})</span>
                      <button 
                        className="btn btn-secondary btn-xs flex items-center gap-1"
                        onClick={() => { setViewProofModal(sub); sound.playKeypadBeep(); }}
                      >
                        <Eye size={13} />
                        <span>{t?.viewProofModalTitle || "Audit Details"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WALLET & CASH-OUT LEDGER */}
      {activeTab === 'wallet' && (
        <div className="worker-wallet-section animate-fade-in">
          <div className="marketplace-header-row">
            <div>
              <h3 className="section-heading">{t?.walletAndPayouts || "Wallet & Cash-Out"}</h3>
              <p className="section-subheading">Safaricom Daraja B2C instant cash-out and escrow settlement records</p>
            </div>
            <button 
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={onOpenWithdraw}
            >
              <ArrowUpRight size={16} />
              <span>{t?.withdrawBtn || "Withdraw to M-Pesa"}</span>
            </button>
          </div>

          <div className="wallet-overview-grid">
            {/* Quick Withdraw Card */}
            <div className="glass-card wallet-highlight-card">
              <div className="wallet-card-header">
                <div>
                  <span className="text-xs text-muted uppercase font-bold">{t?.availableBalance || "Available Balance"}</span>
                  <div className="wallet-big-balance text-green">
                    {worker.walletBalanceETB.toFixed(2)} <span className="currency-etb text-sm">ETB</span>
                  </div>
                </div>
                <div className="card-icon-pill green">
                  <Wallet size={22} />
                </div>
              </div>

              <div className="wallet-progress-bar-block my-3">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{t?.dailyLimitUsed || "Daily Limit Used"}:</span>
                  <span>{worker.dailyWithdrawnETB.toFixed(2)} / {worker.dailyLimitETB.toFixed(2)} ETB</span>
                </div>
                <div className="slots-progress-bar">
                  <div 
                    className="slots-progress-fill" 
                    style={{ width: `${Math.min(100, (worker.dailyWithdrawnETB / worker.dailyLimitETB) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  className="btn btn-primary w-full flex items-center justify-center gap-1"
                  onClick={onOpenWithdraw}
                >
                  <ArrowUpRight size={16} />
                  <span>{t?.withdrawBtn || "Withdraw to M-Pesa"}</span>
                </button>
                {onOpenPhoneSim && (
                  <button 
                    className="btn btn-secondary flex items-center justify-center gap-1"
                    onClick={onOpenPhoneSim}
                    title="View M-Pesa Phone Simulator"
                  >
                    <Smartphone size={16} />
                    <span>{t?.phoneSim || "Phone"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Escrow Guarantee Card */}
            <div className="glass-card wallet-escrow-card">
              <div className="wallet-card-header">
                <div>
                  <span className="text-xs text-muted uppercase font-bold">{t?.inEscrow || "Pending Escrow"}</span>
                  <div className="wallet-big-balance text-gold">
                    {worker.escrowPendingETB.toFixed(2)} <span className="currency-etb text-sm">ETB</span>
                  </div>
                </div>
                <div className="card-icon-pill gold">
                  <Clock size={22} />
                </div>
              </div>
              <p className="text-xs text-muted my-2">
                {t?.escrowLockedNotice || "Funds are securely locked in Safaricom Till escrow. Businesses cannot withdraw escrow once you submit genuine work."}
              </p>
              <div className="mt-3">
                <button 
                  className="btn btn-secondary btn-sm w-full"
                  onClick={() => { setActiveTab('submissions'); setSubmissionFilter('pending'); }}
                >
                  <span>View {pendingSubmissions.length} Pending Tasks</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* M-Pesa B2C Cash-Out & Escrow Ledger */}
          <div className="wallet-ledger-card glass-card mt-6">
            <div className="ledger-header flex justify-between items-center mb-4">
              <div>
                <h4 className="font-semibold text-base">{t?.b2cHistory || "M-Pesa B2C Cash-Out Records"}</h4>
                <p className="text-xs text-muted">Real-time settlement stream via Safaricom Daraja API</p>
              </div>
              <span className="badge badge-green badge-sm">Safaricom B2C Active</span>
            </div>

            {workerLogs.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">
                <Smartphone size={32} className="mx-auto mb-2 text-muted" />
                <p>No recent cashouts. Click "Withdraw to M-Pesa" above to test instant B2C payout!</p>
              </div>
            ) : (
              <div className="payouts-table-container">
                <table className="payouts-table w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-glass text-muted text-xs uppercase">
                      <th className="py-2">Receipt / ID</th>
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerLogs.map((log) => (
                      <tr key={log.id} className="border-b border-glass hover:bg-slate-800/20">
                        <td className="py-2 font-mono text-xs text-slate-300">
                          {log.mpesaReceipt || log.checkoutRequestId || log.conversationId || log.id}
                        </td>
                        <td className="py-2 text-xs text-muted">{log.timestamp}</td>
                        <td className="py-2">
                          <span className={`badge badge-xs ${log.type.includes('B2C') ? 'badge-green' : 'badge-silver'}`}>
                            {log.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 font-bold text-green">
                          {log.amountETB ? `${log.amountETB.toFixed(2)} ETB` : '-'}
                        </td>
                        <td className="py-2">
                          <span className="badge badge-green badge-xs">{log.status}</span>
                        </td>
                        <td className="py-2 text-xs text-muted truncate max-w-xs">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REFERRAL PROGRAM */}
      {activeTab === 'referrals' && (
        <div className="worker-referral-tab animate-fade-in">
          <div className="marketplace-header-row">
            <div>
              <h3 className="section-heading">{t?.referralProgram || "Referral Rewards"}</h3>
              <p className="section-subheading">Earn 15 ETB per verified friend without pyramid schemes</p>
            </div>
            <div className="badge badge-gold">Zero-Pyramid Guarantee</div>
          </div>

          <div className="referral-rule-box glass-card mb-4">
            <Info size={20} className="text-gold flex-shrink-0" />
            <p className="text-sm">
              {t?.referralNotice || "No-Pyramid Policy: Bonus unlocks strictly when your invitee completes their first verified task. No multi-level marketing, just real rewards for growing the verified workforce."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="referral-code-block glass-card p-4">
              <label className="form-label text-sm font-semibold mb-2 block">{t?.myReferralCode || "Your Referral Code"}</label>
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
                  {copiedCode ? (t?.copied || "Copied!") : (t?.copy || "Copy")}
                </button>
              </div>
              <p className="text-xs text-muted mt-2">Share this code with friends in Addis Ababa and across Ethiopia.</p>
            </div>

            <div className="referral-stats-grid">
              <div className="ref-stat-box glass-card">
                <span className="ref-stat-val text-2xl font-bold">{worker.referralCount}</span>
                <span className="ref-stat-lbl text-xs text-muted">{t?.friendsInvited || "Friends Invited"}</span>
              </div>
              <div className="ref-stat-box glass-card">
                <span className="ref-stat-val text-green text-2xl font-bold">{worker.referralUnlockedETB.toFixed(2)} ETB</span>
                <span className="ref-stat-lbl text-xs text-muted">{t?.bonusReleased || "Bonus Released"}</span>
              </div>
            </div>
          </div>

          <div className="referral-friends-list glass-card p-4">
            <h5 className="mb-3 text-sm font-semibold">{t?.invitedFriends || "Your Invited Friends:"}</h5>
            <div className="friend-row">
              <span className="font-medium">Abebe K. (0781 *** 12)</span>
              <span className="badge badge-green badge-sm">{t?.taskApprovedBonus || "1 Task Approved (+15 ETB Released)"}</span>
            </div>
            <div className="friend-row">
              <span className="font-medium">Bethlehem T. (0719 *** 44)</span>
              <span className="badge badge-green badge-sm">{t?.taskApprovedBonus || "1 Task Approved (+15 ETB Released)"}</span>
            </div>
            <div className="friend-row">
              <span className="font-medium">Natnael S. (0722 *** 89)</span>
              <span className="badge badge-silver badge-sm">{t?.signedUpPending || "Signed Up (Task Pending)"}</span>
            </div>
          </div>
        </div>
      )}

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
                <span className="reward-tag">{t?.reward || "Reward"}</span>
                <span className="reward-val">{activeTaskModal.rewardETB.toFixed(2)} ETB</span>
              </div>
            </div>

            <div className="modal-body">
              {/* Target Action Link */}
              {activeTaskModal.targetUrl && activeTaskModal.targetUrl !== '#' && (
                <div className="target-link-box">
                  <span className="target-box-title">{t?.step1OpenUrl || "Required Step 1: Open Target URL"}</span>
                  <a 
                    href={activeTaskModal.targetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-secondary btn-sm"
                  >
                    {t?.openTargetLink || "Open Target Link / App"}
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Step by step checklist */}
              <div className="modal-checklist">
                <h5 className="checklist-heading">{t?.guidelinesHeading || "Verification Guidelines:"}</h5>
                <ul className="guidelines-list">
                  {activeTaskModal.guidelines.map((guide, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={15} className="text-green flex-shrink-0" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Anti-bot Action Timer with Fast-Forward demo button */}
              <div className={`action-timer-box ${timerFinished ? 'timer-ready' : 'timer-counting'}`}>
                <div className="timer-icon-col">
                  <Clock size={20} className={timerFinished ? 'text-green' : 'text-gold'} />
                </div>
                <div className="timer-text-col">
                  {timerFinished ? (
                    <div>
                      <strong className="text-green">{t?.timerCompleted || "Action Timer Completed!"}</strong>
                      <p className="text-xs text-muted">{t?.timerCompletedDesc || "Proof submission unlocked. Submit your genuine screenshot below."}</p>
                    </div>
                  ) : (
                    <div>
                      <strong className="text-gold">{t?.actionTimer || "Proof unlocks in"} {actionTimer}s</strong>
                      <p className="text-xs text-muted">{t?.timerCountingDesc || "Prevents bots & guarantees tasks are performed legitimately before upload unlocks."}</p>
                    </div>
                  )}
                </div>
                {!timerFinished && (
                  <button 
                    type="button" 
                    className="btn btn-xs btn-outline-gold ml-auto"
                    onClick={handleSkipTimer}
                    title="Skip timer for hackathon evaluation"
                  >
                    <Zap size={12} />
                    <span>{t?.skipTimerDemo || "⚡ Skip Timer (Demo)"}</span>
                  </button>
                )}
              </div>

              {/* Proof Selection Form */}
              <form onSubmit={handleSubmitProof} className="proof-form">
                <div className="form-group">
                  <label className="form-label">{t?.uploadScreenshot || "Upload Screenshot / Proof"}</label>

                  {/* Real Device File Upload Dropzone */}
                  <div className="custom-upload-zone glass-card mb-3">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proof-file-input"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="upload-icon-circle">
                          <Upload size={18} className="text-green" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm block">
                            {uploadedFile ? "Custom File Attached" : (t?.dragOrUpload || "Upload Genuine Screenshot")}
                          </span>
                          <span className="text-xs text-muted">
                            {uploadedFile ? selectedProofPreset.name : (t?.clickToUploadFile || "Click to browse image from your device")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {uploadedFile ? (
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-xs text-danger"
                            onClick={handleClearUpload}
                          >
                            <XCircle size={14} />
                            <span>{t?.clearUpload || "Clear"}</span>
                          </button>
                        ) : (
                          <label htmlFor="proof-file-input" className="btn btn-secondary btn-xs cursor-pointer">
                            <ImageIcon size={14} />
                            <span>{t?.chooseFile || "Choose File"}</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preset Proof Quick Picker (For demo convenience) */}
                  <div className="preset-picker-label">
                    <span>{t?.quickPresets || "⚡ Quick Test Proof Presets (for Hackathon testing):"}</span>
                  </div>
                  <div className="proof-presets-grid">
                    {sampleProofTemplates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        className={`preset-proof-btn ${selectedProofPreset.id === tmpl.id && !uploadedFile ? 'active' : ''}`}
                        onClick={() => {
                          setUploadedFile(null);
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
                        <span className="ai-precheck-title">{t?.liveAiScreening || "Live AI Screening:"}</span>
                        <span className={`ai-score ${selectedProofPreset.mockAiConfidence > 70 ? 'text-green' : 'text-danger'}`}>
                          {selectedProofPreset.mockAiConfidence}% Match
                        </span>
                      </div>
                      <div className="ai-precheck-row">
                        <ShieldCheck size={14} className={selectedProofPreset.isDup ? 'text-danger' : 'text-green'} />
                        <span className="ai-precheck-title">{t?.duplicateHashLabel || "Duplicate Hash:"}</span>
                        <span className={selectedProofPreset.isDup ? 'text-danger' : 'text-green'}>
                          {selectedProofPreset.isDup ? (t?.flaggedDup || 'FLAGGED (MATCH FOUND)') : (t?.uniquePassed || 'UNIQUE (PASSED)')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker notes */}
                <div className="form-group">
                  <label className="form-label">{t?.workerCommentsLabel || "Worker Comments / Review Link:"}</label>
                  <textarea 
                    className="form-textarea"
                    rows="2"
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    placeholder={t?.workerCommentsPlaceholder || "E.g., Posted review under username 'KidusG' with photo"}
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
                    {t?.cancel || "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!timerFinished || isSubmitting}
                  >
                    {isSubmitting ? (t?.submitting || "Submitting...") : (t?.submitProof || "Submit Verification Proof")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Proof Inspection Modal (from My Submissions) */}
      {viewProofModal && (
        <div className="modal-backdrop" onClick={() => setViewProofModal(null)}>
          <div className="modal-content glass-card task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-silver mb-1">{viewProofModal.id}</span>
                <h3 className="modal-task-title">{viewProofModal.taskTitle}</h3>
                <span className="text-xs text-muted">Submitted: {new Date(viewProofModal.submittedAt).toLocaleString()}</span>
              </div>
              <button className="btn-close" onClick={() => setViewProofModal(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="proof-full-preview-container mb-4">
                <img 
                  src={viewProofModal.proofImage} 
                  alt="Audit Proof" 
                  className="w-full rounded-lg max-h-80 object-cover border border-glass"
                />
              </div>

              <div className="ai-audit-breakdown-card glass-card p-4 mb-3">
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-green" />
                  <span>AI Verification & Perceptual Hash Audit:</span>
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted block">AI Confidence Score:</span>
                    <strong className={viewProofModal.aiScreening?.confidence > 70 ? 'text-green' : 'text-danger'}>
                      {viewProofModal.aiScreening?.confidence || 95}% Match
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted block">Duplicate Signature:</span>
                    <strong className={viewProofModal.duplicateCheck?.isDuplicate ? 'text-danger' : 'text-green'}>
                      {viewProofModal.duplicateCheck?.isDuplicate ? 'FLAGGED (MATCH FOUND)' : 'UNIQUE (PASSED)'}
                    </strong>
                  </div>
                </div>
                {viewProofModal.aiScreening?.detectedText && (
                  <div className="mt-2 text-xs bg-slate-900/60 p-2 rounded">
                    <span className="text-muted block">OCR Text Read:</span>
                    <span className="text-slate-300 font-mono">{viewProofModal.aiScreening.detectedText}</span>
                  </div>
                )}
              </div>

              <div className="proof-worker-note-box glass-card p-3 mb-4 text-xs">
                <span className="text-muted block mb-1 font-semibold">{t?.workerCommentsLabel || "Worker Comment:"}</span>
                <p className="italic text-slate-200">"{viewProofModal.proofText}"</p>
              </div>

              {viewProofModal.rejectionReason && (
                <div className="sub-status-alert rejected-alert mb-4">
                  <AlertCircle size={16} className="text-danger flex-shrink-0" />
                  <div className="text-xs">
                    <strong>Rejection Reason:</strong> {viewProofModal.rejectionReason}
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary w-full"
                onClick={() => setViewProofModal(null)}
              >
                Close Audit Details
              </button>
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
                <h3>{t?.referralProgram || "Referral Rewards"}</h3>
              </div>
              <button className="btn-close" onClick={() => setShowReferralDrawer(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="referral-rule-box">
                <Info size={18} className="text-gold flex-shrink-0" />
                <p className="text-sm">{t?.referralNotice || "No-Pyramid Policy: Bonus unlocks strictly when your invitee completes their first verified task."}</p>
              </div>

              <div className="referral-code-block">
                <label className="form-label">{t?.myReferralCode || "Your Referral Code"}</label>
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
                    {copiedCode ? (t?.copied || "Copied!") : (t?.copy || "Copy")}
                  </button>
                </div>
              </div>

              <div className="referral-stats-grid">
                <div className="ref-stat-box">
                  <span className="ref-stat-val">{worker.referralCount}</span>
                  <span className="ref-stat-lbl">{t?.friendsInvited || "Friends Invited"}</span>
                </div>
                <div className="ref-stat-box">
                  <span className="ref-stat-val text-green">{worker.referralUnlockedETB.toFixed(2)} ETB</span>
                  <span className="ref-stat-lbl">{t?.bonusReleased || "Bonus Released"}</span>
                </div>
              </div>

              <div className="referral-friends-list">
                <h5 className="mb-2 text-sm font-semibold">{t?.invitedFriends || "Your Invited Friends:"}</h5>
                <div className="friend-row">
                  <span>Abebe K. (0781 *** 12)</span>
                  <span className="badge badge-green badge-sm">{t?.taskApprovedBonus || "1 Task Approved (+15 ETB Released)"}</span>
                </div>
                <div className="friend-row">
                  <span>Bethlehem T. (0719 *** 44)</span>
                  <span className="badge badge-green badge-sm">{t?.taskApprovedBonus || "1 Task Approved (+15 ETB Released)"}</span>
                </div>
                <div className="friend-row">
                  <span>Natnael S. (0722 *** 89)</span>
                  <span className="badge badge-silver badge-sm">{t?.signedUpPending || "Signed Up (Task Pending)"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
