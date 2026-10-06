import React, { useState } from 'react';
import { 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  Building2, 
  Eye, 
  Check, 
  AlertTriangle, 
  Flame,
  Smartphone
} from 'lucide-react';
import { sound } from '../utils/audio';
import { rejectionReasons } from '../data/mockData';

export function BusinessView({ 
  business, 
  submissions, 
  onApproveSubmission, 
  onRejectSubmission, 
  onFundNewTask, 
  onOpenStkPushSim,
  t 
}) {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'create' | 'analytics'
  
  // New task form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('appReview');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [slots, setSlots] = useState(50);
  const [rewardETB, setRewardETB] = useState(25);
  const [minTier, setMinTier] = useState('Bronze');
  const [guidelinesText, setGuidelinesText] = useState("1. Must have active account\n2. Follow instructions carefully\n3. Attach clear screenshot proof");
  const [phoneForPush, setPhoneForPush] = useState('0789 201 000');

  // Selected submission preview
  const [selectedSub, setSelectedSub] = useState(null);
  const [rejectionModalSub, setRejectionModalSub] = useState(null);
  const [selectedReason, setSelectedReason] = useState(rejectionReasons[0]);

  // Financial calculations
  const workerPoolETB = slots * rewardETB;
  const platformFeeETB = Math.round(workerPoolETB * 0.15);
  const totalEscrowPushETB = workerPoolETB + platformFeeETB;

  // Handle post task submit
  const handlePostTaskSubmit = (e) => {
    e.preventDefault();
    sound.playMpesaTone();

    const newTaskData = {
      title,
      category,
      description,
      targetUrl,
      totalSlots: parseInt(slots),
      rewardETB: parseFloat(rewardETB),
      minTier,
      guidelines: guidelinesText.split('\n').filter(g => g.trim().length > 0),
      escrowAmount: totalEscrowPushETB,
      phone: phoneForPush
    };

    onFundNewTask(newTaskData);
  };

  const handleApprove = (sub) => {
    sound.playCashoutChime();
    onApproveSubmission(sub.id, sub.rewardETB);
  };

  const handleOpenReject = (sub) => {
    setRejectionModalSub(sub);
  };

  const handleConfirmReject = () => {
    if (rejectionModalSub) {
      sound.playKeypadBeep();
      onRejectSubmission(rejectionModalSub.id, selectedReason);
      setRejectionModalSub(null);
    }
  };

  return (
    <div className="business-view-container animate-fade-in">
      {/* Business Profile & Escrow Summary Bar */}
      <div className="business-header-card glass-card">
        <div className="business-profile-col">
          <div className="business-icon-avatar">
            <Building2 size={24} className="text-green" />
          </div>
          <div>
            <div className="biz-title-row">
              <h2 className="biz-name">{business.name}</h2>
              <span className="badge badge-green">
                <Check size={12} /> {t?.verifiedMerchant || "Verified Merchant"}
              </span>
            </div>
            <p className="biz-meta">
              {t?.tillShortcode || "Till Shortcode"}: <strong>{business.shortcode}</strong> • {t?.escrowChannel || "Safaricom Escrow Channel"}
            </p>
          </div>
        </div>

        {/* Escrow Metric Cards */}
        <div className="biz-metrics-row">
          <div className="biz-metric-item">
            <span className="metric-lbl">{t?.mpesaEscrowBalance || "M-Pesa Escrow Balance"}</span>
            <span className="metric-val text-green">
              {business.balanceInEscrowETB.toLocaleString()} <span className="text-gold text-sm">ETB</span>
            </span>
          </div>
          <div className="biz-metric-item">
            <span className="metric-lbl">{t?.totalTasksApproved || "Total Tasks Approved"}</span>
            <span className="metric-val">{business.totalTasksApproved}</span>
          </div>
          <div className="biz-metric-item">
            <span className="metric-lbl">{t?.avgReviewSpeed || "Avg. Review Speed"}</span>
            <span className="metric-val text-blue">{business.avgReviewTimeMinutes} {t?.mins || "mins"}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="business-tabs-nav glass-card">
        <button 
          className={`biz-tab-btn ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => { setActiveTab('review'); sound.playKeypadBeep(); }}
        >
          <Layers size={18} />
          <span>{t?.reviewSubmissions || "Review Submissions"}</span>
          {submissions.filter(s => s.status === 'pending').length > 0 && (
            <span className="pending-badge-pill">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>

        <button 
          className={`biz-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => { setActiveTab('create'); sound.playKeypadBeep(); }}
        >
          <PlusCircle size={18} />
          <span>{t?.postTaskTitle || "Fund & Post Micro-Task"}</span>
        </button>

        <button 
          className={`biz-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); sound.playKeypadBeep(); }}
        >
          <BarChart3 size={18} />
          <span>{t?.analyticsTab || "Analytics & Cost Savings"}</span>
        </button>
      </div>

      {/* TAB 1: REVIEW SUBMISSIONS QUEUE */}
      {activeTab === 'review' && (
        <div className="review-queue-section animate-fade-in">
          <div className="queue-header-row mb-4">
            <div>
              <h3 className="section-heading">{t?.submissionsQueue || "Worker Submissions Queue"}</h3>
              <p className="section-subheading">
                {t?.submissionsSubtitle || "AI screening automatically flags duplicates & low quality. You keep final approval authority."}
              </p>
            </div>
            <div className="ai-status-pill">
              <Sparkles size={16} className="text-green" />
              <span>{t?.aiActive || "AI Pre-Screening: ACTIVE"}</span>
            </div>
          </div>

          <div className="submissions-grid">
            {submissions.filter(s => s.status === 'pending').length === 0 ? (
              <div className="empty-tasks-card glass-card">
                <CheckCircle size={40} className="text-green mb-2" />
                <h4 className="font-semibold text-lg">{t?.allReviewed || "All Submissions Reviewed!"}</h4>
                <p className="text-muted text-sm">{t?.allReviewedDesc || "Great job! There are no pending task submissions waiting for verification."}</p>
              </div>
            ) : (
              submissions.filter(s => s.status === 'pending').map((sub) => (
                <div key={sub.id} className="submission-card glass-card">
                  {/* Card Top: Worker & Task info */}
                  <div className="sub-card-top">
                    <div className="sub-worker-info">
                      <div className="worker-initials-avatar">
                        {sub.workerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="sub-worker-name-row">
                          <span className="sub-worker-name">{sub.workerName}</span>
                          <span className={`badge badge-sm ${sub.workerTier === 'Gold' ? 'badge-gold' : 'badge-silver'}`}>
                            {sub.workerTier}
                          </span>
                        </div>
                        <span className="sub-meta-phone">{sub.workerPhone} • {t?.trustScore || "Trust"}: {sub.workerTrustScore}/100</span>
                      </div>
                    </div>

                    <div className="sub-reward-tag">
                      <span className="sub-reward-amount">+{sub.rewardETB.toFixed(2)} ETB</span>
                      <span className="sub-reward-lbl">{t?.escrowPayout || "Escrow Payout"}</span>
                    </div>
                  </div>

                  {/* Task Title */}
                  <div className="sub-task-title-bar">
                    <span className="text-xs text-muted">{t?.taskLabel || "Task:"}</span>
                    <strong className="text-sm text-main">{sub.taskTitle}</strong>
                  </div>

                  {/* AI & Fraud Screening Results Badge Bar */}
                  <div className="ai-screening-card">
                    <div className="ai-screening-header">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-green" />
                        <span className="font-bold text-sm">{t?.aiAssistant || "AI Screening Assistant"}</span>
                      </div>
                      <span className={`badge ${sub.aiScreening.confidence >= 80 ? 'badge-green' : 'badge-red'}`}>
                        {sub.aiScreening.confidence}% Match
                      </span>
                    </div>

                    <p className="ai-summary-text">{sub.aiScreening.summary}</p>
                    {sub.aiScreening.detectedText && (
                      <div className="ai-ocr-quote">
                        <span className="text-xs text-muted">{t?.detectedOcr || "Detected OCR Content:"}</span>
                        <p className="text-xs italic text-main">"{sub.aiScreening.detectedText}"</p>
                      </div>
                    )}

                    {/* Perceptual Hash Duplicate Status */}
                    <div className="duplicate-check-bar">
                      {sub.duplicateCheck.isDuplicate ? (
                        <div className="dup-alert-box">
                          <AlertTriangle size={16} className="text-danger flex-shrink-0" />
                          <span className="text-xs font-semibold text-danger">
                            {sub.duplicateCheck.note}
                          </span>
                        </div>
                      ) : (
                        <div className="dup-pass-box">
                          <ShieldCheck size={16} className="text-green flex-shrink-0" />
                          <span className="text-xs font-semibold text-green">
                            {t?.hashVerified || "Perceptual Hash Verified: Original unique screenshot."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submitted Proof Section */}
                  <div className="sub-proof-preview-row">
                    <div className="sub-proof-img-col">
                      <img 
                        src={sub.proofImage} 
                        alt="Proof" 
                        className="sub-proof-thumbnail"
                        onClick={() => setSelectedSub(sub)}
                      />
                      <span className="click-to-enlarge-hint">
                        <Eye size={12} /> {t?.clickToEnlarge || "Click to enlarge"}
                      </span>
                    </div>
                    <div className="sub-proof-text-col">
                      <label className="text-xs text-muted font-semibold">{t?.workerNote || "Worker Notes / Link:"}</label>
                      <p className="worker-notes-quote">{sub.proofText}</p>
                    </div>
                  </div>

                  {/* Action Buttons: 1-Click Approve / Reject */}
                  <div className="sub-actions-row">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenReject(sub)}
                    >
                      <XCircle size={15} />
                      {t?.reject || "Reject"}
                    </button>

                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(sub)}
                    >
                      <CheckCircle size={15} />
                      {t?.approve || "Approve & Pay"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POST & FUND NEW TASK VIA STK PUSH */}
      {activeTab === 'create' && (
        <div className="create-task-section animate-fade-in">
          <div className="create-task-grid">
            {/* Form Column */}
            <div className="create-form-card glass-card">
              <div className="form-card-header mb-4">
                <h3 className="section-heading">{t?.postTaskTitle || "Fund & Post Micro-Task"}</h3>
                <p className="section-subheading">
                  Escrow model: Deposit reward pool via Safaricom M-Pesa STK Push. Workers earn only upon approval.
                </p>
              </div>

              <form onSubmit={handlePostTaskSubmit} className="post-task-form">
                <div className="form-group">
                  <label className="form-label">{t?.taskTitleLabel || "Task Title"}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={t?.taskTitlePlaceholder || "e.g. 5-Star Google Maps Review with Photo"} 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">{t?.categoryLabel || "Category"}</label>
                    <select 
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="appReview">{t?.appReview || "App & Maps Review"}</option>
                      <option value="testing">{t?.testing || "App Testing & Feedback"}</option>
                      <option value="surveys">{t?.surveys || "Surveys & Questionnaires"}</option>
                      <option value="social">{t?.social || "Social Media Engagement"}</option>
                      <option value="localData">{t?.localData || "Local Field Data"}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t?.minTierLabel || "Minimum Worker Tier"}</label>
                    <select 
                      className="form-select"
                      value={minTier}
                      onChange={(e) => setMinTier(e.target.value)}
                    >
                      <option value="Bronze">Bronze (Any verified user)</option>
                      <option value="Silver">Silver (Trust score 90+)</option>
                      <option value="Gold">Gold (Expert workers only)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">{t?.slotsNeeded || "Worker Slots Needed"}</label>
                    <input 
                      type="number" 
                      min="10"
                      max="1000"
                      className="form-input" 
                      value={slots}
                      onChange={(e) => setSlots(Math.max(1, parseInt(e.target.value) || 0))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t?.rewardPerWorker || "Reward per Worker (ETB)"}</label>
                    <input 
                      type="number" 
                      min="5"
                      max="500"
                      step="5"
                      className="form-input" 
                      value={rewardETB}
                      onChange={(e) => setRewardETB(Math.max(5, parseFloat(e.target.value) || 0))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t?.targetUrlLabel || "Target Link or App URL (Optional)"}</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://maps.google.com/..." 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t?.taskDescLabel || "Task Description"}</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    placeholder={t?.taskDescPlaceholder || "Describe exactly what the worker needs to do..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{t?.stepByStepLabel || "Step-by-Step Instructions (1 per line)"}</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    value={guidelinesText}
                    onChange={(e) => setGuidelinesText(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{t?.phoneForPushLabel || "Safaricom Phone for M-Pesa STK Push"}</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={phoneForPush}
                    onChange={(e) => setPhoneForPush(e.target.value)}
                    placeholder="07XX XXX XXX"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full">
                  <Flame size={18} />
                  {t?.initiatePush || "Initiate M-Pesa STK Push"} ({totalEscrowPushETB.toLocaleString()} ETB)
                </button>
              </form>
            </div>

            {/* Escrow Fee Calculator Preview Card */}
            <div className="escrow-calc-col">
              <div className="escrow-calc-card glass-card">
                <div className="calc-card-header">
                  <span className="badge badge-gold">{t?.transparentEscrow || "Transparent Escrow Model"}</span>
                  <h4 className="calc-title">{t?.stkBreakdown || "M-Pesa STK Push Breakdown"}</h4>
                </div>

                <div className="calc-breakdown-table">
                  <div className="calc-row">
                    <span className="calc-lbl">{t?.slotsNeeded || "Slots Needed"}:</span>
                    <span className="calc-val">{slots} {t?.workers || "Workers"}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-lbl">{t?.rewardPerWorker || "Reward per Worker"}:</span>
                    <span className="calc-val">{rewardETB.toFixed(2)} ETB</span>
                  </div>
                  <div className="calc-divider"></div>
                  <div className="calc-row">
                    <span className="calc-lbl">{t?.escrowPool || "Worker Escrow Pool"}:</span>
                    <span className="calc-val">{workerPoolETB.toFixed(2)} ETB</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-lbl">{t?.platformFee || "Platform Fee (15%)"}:</span>
                    <span className="calc-val">{platformFeeETB.toFixed(2)} ETB</span>
                  </div>
                  <div className="calc-divider"></div>
                  <div className="calc-row total-row">
                    <span className="calc-lbl font-bold">{t?.totalDeposit || "Total STK Push Amount"}:</span>
                    <span className="calc-total-val">
                      {totalEscrowPushETB.toFixed(2)} <span className="text-gold">ETB</span>
                    </span>
                  </div>
                </div>

                <div className="calc-trust-notice">
                  <ShieldCheck size={20} className="text-green flex-shrink-0" />
                  <p className="text-xs text-muted">
                    {t?.escrowNotice || "Funds are locked in the Safaricom M-Pesa escrow account. If slots remain unfulfilled or tasks are rejected, remaining escrow balance is fully refundable."}
                  </p>
                </div>

                {onOpenStkPushSim && (
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm w-full mt-3 flex items-center justify-center gap-2"
                    onClick={onOpenStkPushSim}
                  >
                    <Smartphone size={15} />
                    <span>{t?.previewPhone || "Preview M-Pesa Phone Screen"}</span>
                  </button>
                )}
              </div>

              {/* Agency Comparison Card */}
              <div className="agency-compare-card glass-card">
                <h5 className="compare-title">{t?.agencyCompareTitle || "Ethio Bucks vs Marketing Agencies"}</h5>
                <div className="compare-metric">
                  <span className="text-xs text-muted">{t?.agencyCost || "Traditional Agency Cost (100 reviews):"}</span>
                  <strong className="text-danger text-sm">~15,000 ETB + 30 Days</strong>
                </div>
                <div className="compare-metric">
                  <span className="text-xs text-muted">{t?.ethioBucksCost || "Ethio Bucks Micro-Task Network:"}</span>
                  <strong className="text-green text-sm">~2,875 ETB + Under 24 Hours</strong>
                </div>
                <div className="savings-badge">
                  <span>{t?.agencyCompareSavings || "80.8% Cost Savings for Ethiopian SMEs"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS ANALYTICS & ROI */}
      {activeTab === 'analytics' && (
        <div className="analytics-section animate-fade-in">
          <div className="analytics-grid">
            <div className="analytics-stat-card glass-card">
              <span className="stat-label">{t?.totalEscrowProcessed || "Total Escrow Processed"}</span>
              <strong className="stat-value text-green">14,250 ETB</strong>
              <span className="stat-delta text-xs text-green">↑ 100% On-Chain via M-Pesa</span>
            </div>

            <div className="analytics-stat-card glass-card">
              <span className="stat-label">{t?.completionRate || "Campaign Completion Rate"}</span>
              <strong className="stat-value">94.8%</strong>
              <span className="stat-delta text-xs text-muted">Across 5 business campaigns</span>
            </div>

            <div className="analytics-stat-card glass-card">
              <span className="stat-label">{t?.avgApprovalTime || "Average Approval-to-Payout"}</span>
              <strong className="stat-value text-gold">3.4 Mins</strong>
              <span className="stat-delta text-xs text-green">Under the 5-min target!</span>
            </div>

            <div className="analytics-stat-card glass-card">
              <span className="stat-label">{t?.fraudBlocked || "Fraudulent Proof Intercepted"}</span>
              <strong className="stat-value text-danger">18 Attempts</strong>
              <span className="stat-delta text-xs text-muted">Blocked by AI & pHash check</span>
            </div>
          </div>

          {/* Demographics & Insights */}
          <div className="analytics-details-grid mt-4">
            <div className="analytics-chart-card glass-card">
              <h4 className="font-semibold mb-3">{t?.subcityEngagement || "Worker Engagement by Sub-City (Addis Ababa)"}</h4>
              <div className="subcity-bars-list">
                <div className="subcity-bar-item">
                  <div className="subcity-bar-meta">
                    <span>Bole (Students & Tech Youth)</span>
                    <strong>38%</strong>
                  </div>
                  <div className="subcity-progress-bar"><div className="fill-green" style={{ width: '38%' }}></div></div>
                </div>
                <div className="subcity-bar-item">
                  <div className="subcity-bar-meta">
                    <span>Kirkos / Kazanchis</span>
                    <strong>26%</strong>
                  </div>
                  <div className="subcity-progress-bar"><div className="fill-green" style={{ width: '26%' }}></div></div>
                </div>
                <div className="subcity-bar-item">
                  <div className="subcity-bar-meta">
                    <span>Yeka / Megenagna</span>
                    <strong>21%</strong>
                  </div>
                  <div className="subcity-progress-bar"><div className="fill-green" style={{ width: '21%' }}></div></div>
                </div>
                <div className="subcity-bar-item">
                  <div className="subcity-bar-meta">
                    <span>Arada / Piassa</span>
                    <strong>15%</strong>
                  </div>
                  <div className="subcity-progress-bar"><div className="fill-green" style={{ width: '15%' }}></div></div>
                </div>
              </div>
            </div>

            <div className="analytics-chart-card glass-card">
              <h4 className="font-semibold mb-3">{t?.escrowHealth || "M-Pesa Escrow Settlement Health"}</h4>
              <ul className="health-check-list">
                <li className="health-item">
                  <CheckCircle size={16} className="text-green" />
                  <div>
                    <strong>STK Push Instant Webhook Callbacks:</strong>
                    <p className="text-xs text-muted">99.8% received within 12 seconds</p>
                  </div>
                </li>
                <li className="health-item">
                  <CheckCircle size={16} className="text-green" />
                  <div>
                    <strong>B2C Worker Disbursal Reliability:</strong>
                    <p className="text-xs text-muted">Instant wallet transfer with automatic retry queue</p>
                  </div>
                </li>
                <li className="health-item">
                  <CheckCircle size={16} className="text-green" />
                  <div>
                    <strong>Safaricom Ethiopia Sandbox Compliance:</strong>
                    <p className="text-xs text-muted">Fully matches Daraja 2.0 B2C & C2B specs</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Proof Fullscreen Modal */}
      {selectedSub && (
        <div className="modal-backdrop" onClick={() => setSelectedSub(null)}>
          <div className="modal-content glass-card proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-green mb-1">Proof Verification View</span>
                <h3>{selectedSub.taskTitle}</h3>
                <span className="text-xs text-muted">Submitted by {selectedSub.workerName}</span>
              </div>
              <button className="btn-close" onClick={() => setSelectedSub(null)}>✕</button>
            </div>
            <div className="modal-body text-center">
              <img src={selectedSub.proofImage} alt="Expanded Proof" className="proof-expanded-img" />
              <div className="mt-3 p-3 bg-elevated rounded text-left">
                <span className="text-xs font-semibold text-muted">{t?.workerNote || "Worker Notes / Link:"}</span>
                <p className="text-sm mt-1">{selectedSub.proofText}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Preset Reasons */}
      {rejectionModalSub && (
        <div className="modal-backdrop" onClick={() => setRejectionModalSub(null)}>
          <div className="modal-content glass-card rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-red mb-1">{t?.reject || "Reject"}</span>
                <h3>Provide Rejection Reason</h3>
                <span className="text-xs text-muted">The slot and reward will be returned to your active campaign pool</span>
              </div>
              <button className="btn-close" onClick={() => setRejectionModalSub(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t?.rejectionReasonLabel || "Select Standard Feedback Reason:"}</label>
                <select 
                  className="form-select"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {rejectionReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div className="alert-box-red mt-3">
                <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                <p className="text-xs text-danger">
                  {t?.rejectionWarning || "Worker trust score will be adjusted and worker will receive an explanatory SMS notification."}
                </p>
              </div>

              <div className="modal-actions-row mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setRejectionModalSub(null)}
                >
                  {t?.cancel || "Cancel"}
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleConfirmReject}
                >
                  {t?.confirmRejection || "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
