import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone,
  Play,
  RotateCcw
} from 'lucide-react';
import { sound } from '../utils/audio';

export function JudgeDemoTour({ 
  onSelectRole, 
  onTriggerDemoStep, 
  onResetDemoData,
  onOpenPhoneSim
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      num: 1,
      title: "Business Funds Task (STK Push)",
      desc: "Business posts a campaign (e.g. 50 slots @ 25 ETB). Safaricom STK Push debits the merchant Till into platform Escrow.",
      roleTarget: "business",
      actionText: "Switch to Business Portal & Preview Escrow",
      tip: "Notice the 15% platform fee & escrow lock guarantee."
    },
    {
      num: 2,
      title: "Worker Starts Task & Action Timer",
      desc: "Ethiopian youth browse tasks. Proof upload is locked behind a 15-20s minimum action timer to eliminate automated bot spam.",
      roleTarget: "worker",
      actionText: "Switch to Worker Feed & View Timer",
      tip: "Try clicking on a task to see the anti-bot countdown timer."
    },
    {
      num: 3,
      title: "AI Screening & Duplicate pHash Check",
      desc: "Proof upload undergoes perceptual hash check against past submissions, while AI pre-screens screenshot validity.",
      roleTarget: "business",
      actionText: "View AI Screening in Verification Queue",
      tip: "Notice the 96% AI confidence score and duplicate hash status."
    },
    {
      num: 4,
      title: "Approval & Escrow Wallet Credit",
      desc: "Business clicks 'Approve & Pay'. Escrow funds are instantly released and credited to the worker's wallet balance.",
      roleTarget: "business",
      actionText: "Approve Submission & Release Escrow",
      tip: "Listen for the chime and observe the escrow balance updating."
    },
    {
      num: 5,
      title: "Instant Cash-Out via M-Pesa B2C",
      desc: "Worker requests withdrawal. Safaricom B2C API transfers the Birr straight to their phone with real SMS confirmation.",
      roleTarget: "worker",
      actionText: "Open M-Pesa Withdrawal & See SMS",
      tip: "Free withdrawal for workers; check the phone simulator for the SMS!"
    }
  ];

  const handleStepClick = (idx) => {
    setCurrentStep(idx);
    const step = steps[idx];
    onSelectRole(step.roleTarget);
    sound.playKeypadBeep();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepClick(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepClick(currentStep - 1);
    }
  };

  const active = steps[currentStep];

  return (
    <div className="judge-tour-container glass-card animate-fade-in mb-6">
      {/* Tour Header */}
      <div className="judge-tour-top">
        <div className="tour-badge-title">
          <div className="tour-star-icon">
            <Zap size={18} className="text-gold" />
          </div>
          <div>
            <h3 className="tour-heading">Hackathon 2-Minute Judging Walkthrough</h3>
            <p className="tour-sub">Experience the complete end-to-end M-Pesa escrow lifecycle in 5 quick steps</p>
          </div>
        </div>

        <div className="tour-controls-right">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenPhoneSim}
            title="Open Safaricom Phone Screen"
          >
            <Smartphone size={15} />
            Toggle Phone View
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetDemoData}
            title="Reset to initial state"
          >
            <RotateCcw size={15} />
            Reset State
          </button>
        </div>
      </div>

      {/* Step Selector Pills */}
      <div className="tour-steps-row">
        {steps.map((st, i) => (
          <button
            key={st.num}
            className={`tour-step-pill ${currentStep === i ? 'active' : ''} ${currentStep > i ? 'completed' : ''}`}
            onClick={() => handleStepClick(i)}
          >
            <span className="step-num-circle">
              {currentStep > i ? <CheckCircle2 size={13} className="text-green" /> : st.num}
            </span>
            <span className="step-title-text">{st.title}</span>
          </button>
        ))}
      </div>

      {/* Active Step Details Card */}
      <div className="active-step-card">
        <div className="active-step-content">
          <div className="step-counter-tag">
            Step {active.num} of 5 • {active.roleTarget === 'business' ? '🏢 Business View' : '👨🏽‍💻 Worker View'}
          </div>
          <h4 className="active-step-title">{active.title}</h4>
          <p className="active-step-desc">{active.desc}</p>
          <span className="active-step-tip">
            💡 <strong>Judge Note:</strong> {active.tip}
          </span>
        </div>

        <div className="active-step-action-col">
          <button 
            className="btn btn-primary"
            onClick={() => {
              onSelectRole(active.roleTarget);
              onTriggerDemoStep(active.num);
            }}
          >
            <Play size={16} />
            {active.actionText}
          </button>

          <div className="tour-nav-btns mt-2">
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handlePrev} 
              disabled={currentStep === 0}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleNext} 
              disabled={currentStep === steps.length - 1}
            >
              Next Step <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
