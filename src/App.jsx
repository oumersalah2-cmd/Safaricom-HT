import React, { useState } from 'react';
import './App.css';
import { 
  initialTasks, 
  initialWorker, 
  initialBusiness, 
  initialSubmissions, 
  initialMpesaLogs 
} from './data/mockData';
import { translations } from './utils/i18n';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { WorkerView } from './components/WorkerView';
import { BusinessView } from './components/BusinessView';
import { JudgeDemoTour } from './components/JudgeDemoTour';
import { MpesaSimulator } from './components/MpesaSimulator';
import { WithdrawModal } from './components/WithdrawModal';
import { MpesaApiLogsModal } from './components/MpesaApiLogsModal';

export function App() {
  const [role, setRole] = useState('worker'); // 'worker' | 'business' | 'judge_demo' | 'api_logs'
  const [lang, setLang] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core Data State
  const [tasks, setTasks] = useState(initialTasks);
  const [worker, setWorker] = useState(initialWorker);
  const [business, setBusiness] = useState(initialBusiness);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [logs, setLogs] = useState(initialMpesaLogs);

  // Modals & Drawers
  const [isPhoneSimOpen, setIsPhoneSimOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);
  const [pendingTaskCreation, setPendingTaskCreation] = useState(null);

  // Translations
  const t = translations[lang] || translations.en;

  // Handle worker submitting a task
  const handleWorkerSubmitTask = (submissionData) => {
    const newSubId = "sub-" + (Date.now() % 10000);
    const newSubmission = {
      id: newSubId,
      taskId: submissionData.taskId,
      taskTitle: submissionData.taskTitle,
      workerId: worker.id,
      workerName: worker.name,
      workerPhone: worker.phone,
      workerTier: worker.tier,
      workerTrustScore: worker.trustScore,
      submittedAt: new Date().toISOString(),
      proofImage: submissionData.proofImage,
      proofText: submissionData.proofText,
      status: "pending",
      rewardETB: submissionData.rewardETB,
      aiScreening: submissionData.aiScreening,
      duplicateCheck: submissionData.duplicateCheck
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Update worker in escrow
    setWorker(prev => ({
      ...prev,
      escrowPendingETB: prev.escrowPendingETB + submissionData.rewardETB
    }));

    // Update task slot
    setTasks(prev => prev.map(tk => {
      if (tk.id === submissionData.taskId) {
        return {
          ...tk,
          completedSlots: Math.min(tk.totalSlots, tk.completedSlots + 1)
        };
      }
      return tk;
    }));
  };

  // Handle business initiating new task funding via STK Push
  const handleFundNewTask = (taskFormData) => {
    setPendingTaskCreation(taskFormData);
    setActivePrompt({
      type: 'STK_PUSH',
      amount: taskFormData.escrowAmount,
      tillNumber: business.shortcode,
      phone: taskFormData.phone
    });
    setIsPhoneSimOpen(true);
  };

  // Resolve STK Push prompt from phone simulator
  const handleResolvePhonePrompt = (success, receiptCode) => {
    if (success && pendingTaskCreation) {
      const newTaskId = "task-" + (Date.now() % 10000);
      const newTask = {
        id: newTaskId,
        businessId: business.id,
        businessName: business.name,
        businessLogo: "🌟",
        category: pendingTaskCreation.category,
        title: pendingTaskCreation.title,
        description: pendingTaskCreation.description,
        guidelines: pendingTaskCreation.guidelines,
        rewardETB: pendingTaskCreation.rewardETB,
        totalSlots: pendingTaskCreation.totalSlots,
        completedSlots: 0,
        timerSeconds: 15,
        status: "active",
        minTier: pendingTaskCreation.minTier,
        createdAt: new Date().toISOString(),
        escrowLockedETB: pendingTaskCreation.escrowAmount,
        proofType: "screenshot",
        targetUrl: pendingTaskCreation.targetUrl
      };

      setTasks(prev => [newTask, ...prev]);

      // Update business escrow
      setBusiness(prev => ({
        ...prev,
        balanceInEscrowETB: prev.balanceInEscrowETB + pendingTaskCreation.escrowAmount,
        activeCampaignsCount: prev.activeCampaignsCount + 1
      }));

      // Log STK Push Request and Webhook Callback
      const newLogs = [
        {
          id: "log-" + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: "STK_PUSH_REQUEST",
          endpoint: "/mpesa/stkpush/v1/processrequest",
          shortCode: business.shortcode,
          amountETB: pendingTaskCreation.escrowAmount,
          phone: pendingTaskCreation.phone,
          status: "SUCCESS",
          checkoutRequestId: "ws_CO_" + Date.now(),
          details: `Funded ${pendingTaskCreation.totalSlots} slots for '${pendingTaskCreation.title}'`
        },
        {
          id: "log-" + (Date.now() + 1),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: "STK_CALLBACK",
          endpoint: "/api/mpesa/callbacks/stk",
          resultCode: 0,
          resultDesc: "The service request is processed successfully.",
          mpesaReceipt: receiptCode || ("SDF" + Math.floor(100000 + Math.random() * 900000)),
          amountETB: pendingTaskCreation.escrowAmount,
          status: "PROCESSED",
          details: `Escrow credited: ${pendingTaskCreation.escrowAmount.toFixed(2)} ETB into Till ${business.shortcode}`
        }
      ];

      setLogs(prev => [...newLogs, ...prev]);
      setPendingTaskCreation(null);
    }
    setActivePrompt(null);
  };

  // Business approves submission -> releases escrow to worker wallet
  const handleApproveSubmission = (subId, rewardETB) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, status: 'approved' };
      }
      return s;
    }));

    // Credit worker
    setWorker(prev => ({
      ...prev,
      walletBalanceETB: prev.walletBalanceETB + rewardETB,
      escrowPendingETB: Math.max(0, prev.escrowPendingETB - rewardETB),
      lifetimeEarnedETB: prev.lifetimeEarnedETB + rewardETB,
      completedTasks: prev.completedTasks + 1
    }));

    // Debit business escrow
    setBusiness(prev => ({
      ...prev,
      balanceInEscrowETB: Math.max(0, prev.balanceInEscrowETB - rewardETB),
      totalTasksApproved: prev.totalTasksApproved + 1
    }));

    // Add API log
    const approveLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: "ESCROW_RELEASE_CREDIT",
      endpoint: "/api/escrow/release",
      amountETB: rewardETB,
      status: "SUCCESS",
      details: `Escrow released: ${rewardETB.toFixed(2)} ETB credited to worker wallet.`
    };
    setLogs(prev => [approveLog, ...prev]);
  };

  // Business rejects submission
  const handleRejectSubmission = (subId, reason) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, status: 'rejected', rejectionReason: reason };
      }
      return s;
    }));

    // Find submission reward to adjust pending escrow
    const sub = submissions.find(s => s.id === subId);
    if (sub) {
      setWorker(prev => ({
        ...prev,
        escrowPendingETB: Math.max(0, prev.escrowPendingETB - sub.rewardETB)
      }));
    }
  };

  // Worker confirms withdrawal via M-Pesa B2C
  const handleConfirmWithdraw = (amountETB, receiptCode) => {
    setWorker(prev => ({
      ...prev,
      walletBalanceETB: prev.walletBalanceETB - amountETB,
      dailyWithdrawnETB: prev.dailyWithdrawnETB + amountETB
    }));

    // Create B2C Payout Logs
    const b2cLogs = [
      {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: "B2C_PAYOUT_REQUEST",
        endpoint: "/mpesa/b2c/v1/paymentrequest",
        phone: worker.fullPhone,
        amountETB: amountETB,
        status: "QUEUED",
        conversationId: "AG_" + Date.now(),
        details: `Worker ${worker.phone} requested ${amountETB.toFixed(2)} ETB cashout`
      },
      {
        id: "log-" + (Date.now() + 1),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: "B2C_CALLBACK",
        endpoint: "/api/mpesa/callbacks/b2c",
        resultCode: 0,
        resultDesc: "The service request is processed successfully.",
        mpesaReceipt: receiptCode,
        amountETB: amountETB,
        status: "COMPLETED",
        details: `Disbursed ${amountETB.toFixed(2)} ETB to Safaricom M-Pesa wallet`
      }
    ];

    setLogs(prev => [...b2cLogs, ...prev]);
  };

  // Judge Demo Tour Triggers
  const handleTriggerDemoStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        // Business funds task
        setRole('business');
        break;
      case 2:
        // Worker feed & timer
        setRole('worker');
        break;
      case 3:
        // AI screening queue
        setRole('business');
        break;
      case 4:
        // Approve submission
        setRole('business');
        const pending = submissions.find(s => s.status === 'pending');
        if (pending) {
          handleApproveSubmission(pending.id, pending.rewardETB);
        }
        break;
      case 5:
        // Open withdrawal
        setRole('worker');
        setIsWithdrawOpen(true);
        break;
      default:
        break;
    }
  };

  const handleResetDemoData = () => {
    setTasks(initialTasks);
    setWorker(initialWorker);
    setBusiness(initialBusiness);
    setSubmissions(initialSubmissions);
    setLogs(initialMpesaLogs);
    sound.playSuccess();
  };

  return (
    <div className="app-root">
      {/* Top Sticky Navigation */}
      <Navbar 
        role={role} 
        setRole={setRole} 
        lang={lang} 
        setLang={setLang} 
        t={t} 
        worker={worker}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onTogglePhoneSim={() => setIsPhoneSimOpen(!isPhoneSimOpen)}
        isPhoneSimOpen={isPhoneSimOpen}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {/* Judge 2-Minute Demo Bar (Visible in judge_demo or toggleable) */}
        {role === 'judge_demo' && (
          <JudgeDemoTour 
            onSelectRole={(r) => setRole(r)}
            onTriggerDemoStep={handleTriggerDemoStep}
            onResetDemoData={handleResetDemoData}
            onOpenPhoneSim={() => setIsPhoneSimOpen(true)}
          />
        )}

        {/* Worker View */}
        {role === 'worker' && (
          <WorkerView 
            worker={worker}
            tasks={tasks}
            onStartTask={handleWorkerSubmitTask}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            t={t}
          />
        )}

        {/* Business Portal View */}
        {role === 'business' && (
          <BusinessView 
            business={business}
            submissions={submissions}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
            onFundNewTask={handleFundNewTask}
            onOpenStkPushSim={() => setIsPhoneSimOpen(true)}
            t={t}
          />
        )}

        {/* API Logs & Sandbox Inspector View */}
        {role === 'api_logs' && (
          <MpesaApiLogsModal 
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>

      {/* Interactive Phone Simulator Drawer */}
      <MpesaSimulator 
        isOpen={isPhoneSimOpen}
        onClose={() => setIsPhoneSimOpen(false)}
        activePrompt={activePrompt}
        onResolvePrompt={handleResolvePhonePrompt}
      />

      {/* Worker B2C Cash-out Modal */}
      <WithdrawModal 
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        worker={worker}
        onConfirmWithdraw={handleConfirmWithdraw}
        t={t}
      />
    </div>
  );
}

export default App;
