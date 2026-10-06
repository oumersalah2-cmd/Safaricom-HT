import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api } from './services/api';
import { translations } from './utils/i18n';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { WorkerView } from './components/WorkerView';
import { BusinessView } from './components/BusinessView';
import { MpesaSimulator } from './components/MpesaSimulator';
import { WithdrawModal } from './components/WithdrawModal';
import { MpesaApiLogsModal } from './components/MpesaApiLogsModal';

export function App() {
  // Authentication & Session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ethio_bucks_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    return user?.role || 'worker';
  });

  const [lang, setLang] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Platform Data from Node.js Backend
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [wallet, setWallet] = useState({
    walletBalanceETB: 185.0,
    escrowPendingETB: 85.0,
    lifetimeEarnedETB: 1420.0,
    dailyWithdrawnETB: 0.0,
    dailyLimitETB: 2000.0
  });
  const [logs, setLogs] = useState([]);
  const [smsList, setSmsList] = useState([]);

  // Modals & Drawers
  const [isPhoneSimOpen, setIsPhoneSimOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);
  const [pendingTaskCreation, setPendingTaskCreation] = useState(null);

  // Translations
  const t = translations[lang] || translations.en;

  // Refresh Platform Data from Backend
  const refreshPlatformData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedSubmissions, fetchedLogs, fetchedSms] = await Promise.all([
        api.tasks.getTasks().catch(() => []),
        api.submissions.getSubmissions().catch(() => []),
        api.mpesa.getLogs().catch(() => []),
        api.mpesa.getSms(user?.phone).catch(() => [])
      ]);

      if (Array.isArray(fetchedTasks)) setTasks(fetchedTasks);
      if (Array.isArray(fetchedSubmissions)) setSubmissions(fetchedSubmissions);
      if (Array.isArray(fetchedLogs)) setLogs(fetchedLogs);
      if (Array.isArray(fetchedSms)) setSmsList(fetchedSms);

      if (user?.id) {
        const walletData = await api.wallet.getWallet(user.id).catch(() => null);
        if (walletData?.wallet) {
          setWallet(walletData.wallet);
        }
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }, [user]);

  // Initial load & Polling for real-time updates
  useEffect(() => {
    refreshPlatformData();
    const interval = setInterval(refreshPlatformData, 5000);
    return () => clearInterval(interval);
  }, [refreshPlatformData]);

  // Handle Login
  const handleLoginSuccess = (loggedInUser, loggedInWallet) => {
    setUser(loggedInUser);
    setRole(loggedInUser.role || 'worker');
    if (loggedInWallet) {
      setWallet(loggedInWallet);
    }
    refreshPlatformData();
  };

  // Handle Logout
  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    sound.playKeypadBeep();
  };

  const handleAddSms = (newSms) => {
    setSmsList(prev => [newSms, ...prev]);
  };

  // Worker submits a task proof
  const handleWorkerSubmitTask = async (submissionData) => {
    try {
      const currentWorkerId = user?.id || 'usr-worker-1';
      const res = await api.submissions.submitProof({
        ...submissionData,
        workerId: currentWorkerId
      });

      if (res?.submission) {
        setSubmissions(prev => [res.submission, ...prev]);
      }
      refreshPlatformData();
      sound.playSuccess();
    } catch (err) {
      console.error('Error submitting task:', err);
      alert(err.message || 'Submission failed');
    }
  };

  // Business initiates new task funding via Safaricom STK Push
  const handleFundNewTask = (taskFormData) => {
    setPendingTaskCreation(taskFormData);
    setActivePrompt({
      type: 'STK_PUSH',
      amount: taskFormData.escrowAmount,
      tillNumber: user?.shortcode || '789201',
      phone: taskFormData.phone || user?.phone || '0789 201 000'
    });
    setIsPhoneSimOpen(true);
  };

  // Resolve STK Push prompt from phone simulator
  const handleResolvePhonePrompt = async (success, receiptCode) => {
    if (success && pendingTaskCreation) {
      try {
        const res = await api.tasks.createTask({
          ...pendingTaskCreation,
          businessId: user?.id || 'usr-business-1',
          businessName: user?.name || 'Tomoca Coffee Roasters',
          stkReceipt: receiptCode
        });

        if (res?.task) {
          setTasks(prev => [res.task, ...prev]);
        }
        sound.playMpesaTone();
        refreshPlatformData();
      } catch (err) {
        console.error('Task creation failed:', err);
      } finally {
        setPendingTaskCreation(null);
      }
    }
    setActivePrompt(null);
  };

  // Business approves submission -> releases escrow to worker wallet
  const handleApproveSubmission = async (subId, rewardETB) => {
    try {
      await api.submissions.approve(subId);
      sound.playCashoutChime();
      refreshPlatformData();
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.message || 'Failed to approve');
    }
  };

  // Business rejects submission
  const handleRejectSubmission = async (subId, reason) => {
    try {
      await api.submissions.reject(subId, reason);
      sound.playKeypadBeep();
      refreshPlatformData();
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(err.message || 'Failed to reject');
    }
  };

  // Worker confirms withdrawal via M-Pesa B2C
  const handleConfirmWithdraw = async (amountETB, receiptCode) => {
    try {
      const workerId = user?.id || 'usr-worker-1';
      const phone = user?.phone || '0712 345 678';
      await api.wallet.withdraw(amountETB, phone, workerId);
      sound.playCashoutChime();
      refreshPlatformData();
    } catch (err) {
      console.error('Withdrawal failed:', err);
      alert(err.message || 'Withdrawal failed');
    }
  };

  // Construct worker object for WorkerView
  const currentWorker = {
    id: user?.id || 'usr-worker-1',
    name: user?.name || 'Kidus Girma',
    phone: user?.phone || '0712 345 678',
    network: user?.network || 'Safaricom Ethiopia',
    avatar: user?.avatar || '👨🏽‍💻',
    tier: user?.tier || 'Silver',
    trustScore: user?.trustScore || 94,
    completedTasks: submissions.filter(s => (s.workerId === user?.id || s.workerName === user?.name) && s.status === 'approved').length + 38,
    approvedRate: '97.4%',
    walletBalanceETB: wallet.walletBalanceETB ?? 185.0,
    escrowPendingETB: wallet.escrowPendingETB ?? 85.0,
    lifetimeEarnedETB: wallet.lifetimeEarnedETB ?? 1420.0,
    referralCode: user?.referralCode || 'TITAN-ET-8821',
    referralCount: user?.referralCount ?? 4,
    referralUnlockedETB: user?.referralUnlockedETB ?? 60.0,
    dailyWithdrawnETB: wallet.dailyWithdrawnETB ?? 0.0,
    dailyLimitETB: wallet.dailyLimitETB ?? 2000.0
  };

  // Construct business object for BusinessView
  const currentBusiness = {
    id: user?.id || 'usr-business-1',
    name: user?.name || 'Tomoca Coffee Roasters',
    legalName: user?.legalName || 'Tomoca Coffee PLC (Ethiopia)',
    verified: true,
    shortcode: user?.shortcode || '789201',
    mpesaTill: user?.mpesaTill || '251789201',
    balanceInEscrowETB: wallet.balanceInEscrowETB ?? 3500.0,
    activeCampaignsCount: tasks.filter(t => t.businessId === user?.id || t.businessName === user?.name).length || 3,
    totalTasksApproved: submissions.filter(s => s.status === 'approved').length || 246,
    totalSpentETB: 8610.0,
    avgReviewTimeMinutes: 3.8
  };

  return (
    <div className="app-root">
      {/* If not authenticated, display full Phone OTP Auth Screen */}
      {!user ? (
        <AuthScreen 
          onLoginSuccess={handleLoginSuccess}
          t={t}
        />
      ) : (
        <>
          {/* Top Navigation */}
          <Navbar 
            user={user}
            wallet={wallet}
            role={role} 
            setRole={setRole} 
            lang={lang} 
            setLang={setLang} 
            t={t} 
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onTogglePhoneSim={() => setIsPhoneSimOpen(!isPhoneSimOpen)}
            isPhoneSimOpen={isPhoneSimOpen}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="app-container">
            {/* Worker View */}
            {role === 'worker' && (
              <WorkerView 
                worker={currentWorker}
                tasks={tasks}
                submissions={submissions}
                onStartTask={handleWorkerSubmitTask}
                onOpenWithdraw={() => setIsWithdrawOpen(true)}
                onOpenPhoneSim={() => setIsPhoneSimOpen(true)}
                logs={logs}
                t={t}
              />
            )}

            {/* Business Portal View */}
            {role === 'business' && (
              <BusinessView 
                business={currentBusiness}
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
                onClose={() => setRole(user?.role || 'worker')}
              />
            )}
          </main>

          {/* Interactive Safaricom Phone & SMS Inbox Simulator */}
          <MpesaSimulator 
            isOpen={isPhoneSimOpen}
            onClose={() => setIsPhoneSimOpen(false)}
            activePrompt={activePrompt}
            onResolvePrompt={handleResolvePhonePrompt}
            smsList={smsList}
            onAddSms={handleAddSms}
            t={t}
          />

          {/* Worker B2C Cash-out Modal */}
          <WithdrawModal 
            isOpen={isWithdrawOpen}
            onClose={() => setIsWithdrawOpen(false)}
            worker={currentWorker}
            onConfirmWithdraw={handleConfirmWithdraw}
            onOpenPhoneSim={() => setIsPhoneSimOpen(true)}
            t={t}
          />
        </>
      )}
    </div>
  );
}

export default App;
