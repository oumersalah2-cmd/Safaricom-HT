import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { sound } from '../utils/audio';

export function JudgeDemoTour({ 
  onSelectRole, 
  onTriggerDemoStep, 
  onResetDemoData,
  onOpenPhoneSim,
  onClose,
  t,
  lang = 'en'
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const stepsData = {
    en: [
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
    ],
    am: [
      {
        num: 1,
        title: "ንግዱ ስራ መዝግቦ በኤስቲኬ ፑሽ ያስይዛል",
        desc: "ንግዱ ዘመቻ ይከፍታል (ምሳሌ 50 ቦታ በ25 ብር)። በሳፋሪኮም ኤም-ፔሳ ኤስቲኬ ፑሽ ከቲል ቁጥራቸው ወደ ዋስትና ሂሳብ ገቢ ይሆናል።",
        roleTarget: "business",
        actionText: "ወደ ንግድ ፖርታል ሂድና ዋስትናውን እይ",
        tip: "የ15% የመድረክ ክፍያና የዋስትና ጥበቃውን ልብ ይበሉ።"
      },
      {
        num: 2,
        title: "ሰራተኛው ስራ ጀምሮ ቆጣሪውን ይጠብቃል",
        desc: "ኢትዮጵያውያን ወጣቶች ስራዎችን ይመርጣሉ። ማጭበርበርን ለመከላከል ማስረጃ መስቀያ በ15-20 ሰከንድ የተግባር ቆጣሪ የተቆለፈ ነው።",
        roleTarget: "worker",
        actionText: "ወደ ሰራተኛ ገጽ ሂድና ቆጣሪውን እይ",
        tip: "ስራውን ጠቅ በማድረግ የቦት መከላከያ ቆጣሪውን ይመልከቱ።"
      },
      {
        num: 3,
        title: "የኤአይ ማጣሪያ እና የተደገመ ፎቶ ፍተሻ",
        desc: "የተሰቀለው ስክሪንሾት ከተሰሩ ስራዎች ጋር እንዳይመሳሰል በpHash ሲፈተሽ፣ ኤአይ ደግሞ ይዘቱን ያረጋግጣል።",
        roleTarget: "business",
        actionText: "በማረጋገጫ ዝርዝር ውስጥ የኤአይ ፍተሻውን እይ",
        tip: "የ96% ተዛምዶ ነጥብ እና የተደገመ ፎቶ ያለመኖሩን ሁኔታ ይመልከቱ።"
      },
      {
        num: 4,
        title: "ማጽደቅና ክፍያውን ለሰራተኛው መልቀቅ",
        desc: "ንግዱ 'አጽድቅና ክፍያ ላክ'ን ሲጫን፣ በዋስትና የተያዘው ገንዘብ ወዲያውኑ ለሰራተኛው የኪስ ሂሳብ ገቢ ይሆናል።",
        roleTarget: "business",
        actionText: "ማስረጃውን አጽድቅና ገንዘቡን ልቀቅ",
        tip: "የክፍያውን ድምጽ ያዳምጡና የሂሳብ ለውጡን ያስተውሉ።"
      },
      {
        num: 5,
        title: "ፈጣን ገንዘብ ማውጣት በኤም-ፔሳ ቢ2ሲ",
        desc: "ሰራተኛው ገንዘብ እንዲወጣ ይጠይቃል። የሳፋሪኮም B2C ኤፒአይ ወዲያውኑ ብሩን ወደ ስልካቸው በይፋዊ SMS ይልካል።",
        roleTarget: "worker",
        actionText: "የኤም-ፔሳ ወጪ ክፈትና SMS ተመልከት",
        tip: "ለሰራተኞች ክፍያው ነጻ ነው፤ በስልክ ሲሙሌተሩ የገባውን SMS ይመልከቱ!"
      }
    ],
    om: [
      {
        num: 1,
        title: "Daldalli Hojii Galchee STK Push Wabii Kaffala",
        desc: "Daldalli hojii qopheessa (fkn bakka 50 kaffaltii 25 ETB). Safaricom STK Push Till irraa gara herrega wabiitti qaba.",
        roleTarget: "business",
        actionText: "Gara Fuula Daldalaatti Jijjiiri",
        tip: "Kaffaltii tajaajilaa 15% fi wabii mirkanaa'e hubadhaa."
      },
      {
        num: 2,
        title: "Hojjetaan Hojii Jalqabee Sa'aatii Eega",
        desc: "Dargaggoonni hojii filatu. Kijiba ittisuuf ragaan suuraa sa'aatii hojii sekondii 15-20 booda banama.",
        roleTarget: "worker",
        actionText: "Gara Fuula Hojjetaatti Deemi",
        tip: "Hojicha tuquun sa'aatii ittisa boottii ilaalaa."
      },
      {
        num: 3,
        title: "Qorannoo AI fi Ragaa Lammataa pHash",
        desc: "Suuraan dhiyaate kanaan dura kan hojjatame wajjin pHash dhaan qoratama, AI immoo qulqullina mirkaneessa.",
        roleTarget: "business",
        actionText: "Qorannoo AI Madaallii Keessatti Ilaali",
        tip: "Qabxii 96% AI fi qulqullina ragaa hubadhaa."
      },
      {
        num: 4,
        title: "Mirkaneessuu fi Qarshii Hojjetaaf Gadi Dhiisuu",
        desc: "Daldalli 'Mirkaneessi fi Kaffali' yoo tuqe, qarshiin wabii yeroma sanaa herrega boorsaa hojjetaa gala.",
        roleTarget: "business",
        actionText: "Ragaa Mirkaneessi fi Qarshii Gadi Dhiisi",
        tip: "Sagalee kaffaltii dhagahaa, herregni dabaluu ilaalaa."
      },
      {
        num: 5,
        title: "Kaffaltii Yeroma Sanaa M-Pesa B2C",
        desc: "Hojjetaan baasii gaafata. Safaricom B2C API dhaan birriin gara bilbila isaaniitti ergaa SMS waliin darba.",
        roleTarget: "worker",
        actionText: "M-Pesa Baasi fi Ergaa SMS Ilaali",
        tip: "Hojjettootaaf kaffaltiin bilaashadha; bilbila simuleetaraa irraa SMS ilaalaa!"
      }
    ]
  };

  const steps = stepsData[lang] || stepsData.en;

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
            <h3 className="tour-heading">{t?.judgeTourHeading || "Hackathon 2-Minute Judging Walkthrough"}</h3>
            <p className="tour-sub">{t?.judgeTourSub || "Experience the complete end-to-end M-Pesa escrow lifecycle in 5 quick steps"}</p>
          </div>
        </div>

        <div className="tour-controls-right">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenPhoneSim}
            title={t?.togglePhone || "Open Safaricom Phone Screen"}
          >
            <Smartphone size={15} />
            <span>{t?.togglePhone || "Toggle Phone View"}</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetDemoData}
            title={t?.resetState || "Reset to initial state"}
          >
            <RotateCcw size={15} />
            <span>{t?.resetState || "Reset State"}</span>
          </button>
          {onClose && (
            <button 
              className="btn-close"
              onClick={onClose}
              title={t?.close || "Close"}
            >
              <X size={16} />
            </button>
          )}
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
            {t?.step || "Step"} {active.num} {t?.of || "of"} 5 • {active.roleTarget === 'business' ? (t?.businessViewLabel || '🏢 Business View') : (t?.workerViewLabel || '👨🏽‍💻 Worker View')}
          </div>
          <h4 className="active-step-title">{active.title}</h4>
          <p className="active-step-desc">{active.desc}</p>
          <span className="active-step-tip">
            💡 <strong>{t?.judgeNote || "Judge Note:"}</strong> {active.tip}
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
              <ArrowLeft size={14} /> {t?.back || "Back"}
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleNext} 
              disabled={currentStep === steps.length - 1}
            >
              {t?.nextStep || "Next Step"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
