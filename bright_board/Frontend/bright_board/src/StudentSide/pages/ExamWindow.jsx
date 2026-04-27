import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Shield, ChevronLeft, ChevronRight, Flag, X as XIcon, CheckCircle2, Send, Zap, Book } from 'lucide-react';
import { startExam, submitExam, getExamStudent } from '../../utils/services/exams';
import Button from '../../components/ui/Button';

// ─── Sub-components ──────────────────────────────────────────────────────────

const TimerBar = ({ secondsLeft, totalSeconds }) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isWarning = secondsLeft <= 600 && secondsLeft > 300;
  const isDanger = secondsLeft <= 300;
  const color = isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-cyan-600';
  const bgColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500';
  const shadow = isDanger ? 'animate-pulse' : '';

  return (
    <div className="flex items-center gap-4 bg-white border border-[#e8ebe6] rounded-full px-5 py-2.5 shadow-sm">
      <Clock size={18} className={`${color} ${isDanger ? 'animate-pulse' : ''}`} />
      <span className={`font-bold text-lg ${color} tabular-nums tracking-wide`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <div className="w-32 h-2 bg-[#f9faf6] border border-[#e8ebe6] rounded-full hidden md:block overflow-hidden relative">
        <div className={`h-full ${bgColor} ${shadow} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const QuestionNavigator = ({ questions, answers, markedForReview, currentIndex, onSelect }) => {
  const getState = (idx) => {
    const qId = questions[idx]?.id;
    if (idx === currentIndex) return 'current';
    if (markedForReview.has(qId)) return 'review';
    if (answers[qId] !== undefined) return 'answered';
    return 'not-visited';
  };

  const stateColors = {
    'current': 'bg-cyan-50 text-cyan-600 border border-cyan-200',
    'answered': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    'review': 'bg-amber-50 text-amber-600 border border-amber-200',
    'not-visited': 'bg-white text-[#868685] border border-[#e8ebe6] hover:bg-[#f9faf6]',
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-[#868685] uppercase tracking-widest border-b border-[#e8ebe6] pb-3">Question Map</h3>
      <div className="grid grid-cols-4 gap-3">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-10 h-10 rounded-[12px] font-bold text-sm transition-all duration-300 ${stateColors[getState(idx)]}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div className="space-y-4 pt-6 border-t border-[#e8ebe6] text-[11px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-3 text-[#868685]">
          <div className="w-3 h-3 rounded-full bg-[#e2f6d5]" /> PENDING
        </div>
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" /> COMPLETED
        </div>
        <div className="flex items-center gap-3 text-amber-400">
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" /> MARKED
        </div>
      </div>
    </div>
  );
};

const ViolationWarning = ({ count, maxViolations, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-[#0e0f0c]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-body"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-white border border-red-200 rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 rounded-full"></div>
      
      <div className="w-24 h-24 bg-red-50 border border-red-100 rounded-[20px] flex items-center justify-center mx-auto mb-6">
        <AlertTriangle size={40} className="text-red-500 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-[#0e0f0c] mb-3 font-display tracking-tight">Focus Lost</h2>
      <p className="text-[#868685] mb-8 text-sm tracking-wide leading-relaxed">We detected that you navigated away from the exam window. This action has been logged.</p>
      
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: maxViolations }).map((_, i) => (
          <div key={i} className={`w-12 h-2.5 rounded-full transition-all ${i < count ? 'bg-red-500 shadow-sm' : 'bg-[#f9faf6] border border-[#e8ebe6]'}`} />
        ))}
      </div>
      
      <p className="text-red-600 font-bold mb-8 text-sm tracking-wide bg-red-50 border border-red-100 rounded-[16px] p-4">
        Exam termination in {maxViolations - count} more violation{maxViolations - count !== 1 ? 's' : ''}.
      </p>
      
      <Button
        onClick={onDismiss}
        className="w-full py-4 bg-transparent border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-colors rounded-full"
      >
        I Understand, Return
      </Button>
    </motion.div>
  </motion.div>
);

// ─── Main ExamWindow Component ───────────────────────────────────────────────

const ExamWindow = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  // State
  const [phase, setPhase] = useState('loading'); // loading | instructions | exam | submitted
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_VIOLATIONS = 3;
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimeRef = useRef(null);

  // ─── Load exam info (instructions screen) ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getExamStudent(examId);
        if (data.exam.attempted) {
          setError('Exam already attempted.');
          setPhase('submitted');
          return;
        }
        setExamInfo(data.exam);
        setPhase('instructions');
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setPhase('instructions');
      }
    };
    load();
  }, [examId]);

  // ─── Start exam handler ───────────────────────────────────────────────────
  const handleStartExam = async () => {
    try {
      const { data } = await startExam(examId);
      setExamInfo(data.exam);
      setQuestions(data.questions);
      const duration = data.exam.durationMinutes * 60;
      setSecondsLeft(duration);
      setTotalSeconds(duration);
      startTimeRef.current = Date.now();
      setPhase('exam');

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen?.();
      } catch { }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ─── Auto-save to localStorage every 30s ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`exam_${examId}_currentQ`, String(currentIndex));
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [phase, answers, currentIndex, examId]);

  // Restore from localStorage on start
  useEffect(() => {
    if (phase === 'exam' && questions.length > 0) {
      const saved = localStorage.getItem(`exam_${examId}_answers`);
      const savedQ = localStorage.getItem(`exam_${examId}_currentQ`);
      if (saved) {
        try { setAnswers(JSON.parse(saved)); } catch { }
      }
      if (savedQ) {
        const idx = parseInt(savedQ, 10);
        if (!isNaN(idx) && idx >= 0 && idx < questions.length) setCurrentIndex(idx);
      }
    }
  }, [phase, questions.length]);

  // ─── Proctoring: keyboard blocking + tab detection ────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;

    const blockKeys = (e) => {
      const blocked = [
        e.key === 'Tab',
        e.altKey && e.key !== 'Alt',
        e.key === 'Meta' || e.metaKey,
        e.key === 'F11',
        e.key === 'Escape',
        e.key === 'F12',
        e.ctrlKey && ['w', 't', 'n', 'r', 'a'].includes(e.key.toLowerCase()),
        e.ctrlKey && e.shiftKey,
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) recordViolation('tab_switch');
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (phase === 'exam' && !isSubmittingRef.current) {
          recordViolation('window_blur');
        }
      }, 200);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && phase === 'exam' && !isSubmittingRef.current) {
        setTimeout(() => {
          if (!isSubmittingRef.current) {
            try { document.documentElement.requestFullscreen?.(); } catch { }
          }
        }, 1500);
      }
    };

    const blockContextMenu = (e) => e.preventDefault();

    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  // ─── Violation handler ────────────────────────────────────────────────────
  const recordViolation = useCallback((type) => {
    if (isSubmittingRef.current) return;
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_VIOLATIONS) {
        handleAutoSubmit('violation');
      } else {
        setShowWarning(true);
      }
      return newCount;
    });
  }, []);

  // ─── Submit helpers ───────────────────────────────────────────────────────
  const buildPayload = useCallback((type) => {
    const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    return {
      answers: questions.map(q => ({
        questionId: q.id,
        chosenIndex: answers[q.id]?.chosenIndex ?? null,
        textAnswer: answers[q.id]?.textAnswer || '',
      })),
      tabSwitchCount: violations,
      submissionType: type,
      timeTaken,
    };
  }, [questions, answers, violations]);

  const handleAutoSubmit = useCallback(async (type) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);

    try {
      const { data } = await submitExam(examId, buildPayload(type));
      setSubmitResult({ ...data, submissionType: type });
      setPhase('submitted');
      localStorage.removeItem(`exam_${examId}_answers`);
      localStorage.removeItem(`exam_${examId}_currentQ`);
      try { document.exitFullscreen?.(); } catch { }
    } catch (err) {
      setError(err.response?.data?.error || 'Submission Failed');
      setPhase('submitted');
    }
    setSubmitting(false);
  }, [examId, buildPayload]);

  const handleManualSubmit = async () => {
    setShowConfirmSubmit(false);
    await handleAutoSubmit('manual');
  };

  // ─── Answer handlers ─────────────────────────────────────────────────────
  const selectOption = (questionId, chosenIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: { chosenIndex, textAnswer: '' } }));
  };

  const setTextAnswer = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: { chosenIndex: null, textAnswer: text } }));
  };

  const clearResponse = (questionId) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const toggleReview = (questionId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = markedForReview.size;
  const currentQ = questions[currentIndex];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 bg-[#f9faf6] flex items-center justify-center font-body">
                <div className="flex flex-col items-center gap-6 bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 rounded-[32px] relative z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#e8ebe6] rounded-full"></div>
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0 drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]"></div>
          </div>
          <p className="text-[#868685] font-bold uppercase tracking-widest text-sm animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // ─── INSTRUCTIONS ─────────────────────────────────────────────────────────
  if (phase === 'instructions') {
    return (
      <div className="fixed inset-0 bg-[#f9faf6] overflow-y-auto font-body">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                
        <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
            <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden accent-top-cyan">
              
              {/* Header */}
              <div className="p-8 md:p-10 border-b border-[#e8ebe6] relative bg-white/[0.02]">
                <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-[20px] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-inner">
                    <Book size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight">{examInfo?.title || 'Examination'}</h1>
                    <p className="text-[#868685] mt-2 tracking-wide font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span> {examInfo?.subject || 'General'} Module
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {[
                    { label: 'Duration', value: `${examInfo?.durationMinutes || 0}m` },
                    { label: 'Questions', value: examInfo?.questionCount || '—' },
                    { label: 'Total Marks', value: examInfo?.calculatedTotalMarks || examInfo?.totalMarks || '—' },
                    { label: 'Pass Mark', value: examInfo?.passingMarks ? `${examInfo.passingMarks}%` : '40%' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#f9faf6] border border-[#e8ebe6] rounded-2xl p-4 text-center hover:border-cyan-400 transition-colors">
                      <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-1.5">{item.label}</p>
                      <p className="text-[#0e0f0c] font-bold text-xl">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-center gap-3 text-amber-400 border-b border-[#e8ebe6] pb-4">
                  <Shield size={24} /> <h2 className="text-lg font-bold font-display tracking-wide">Security Protocols</h2>
                </div>

                {examInfo?.instructions && (
                  <div className="p-6 rounded-[20px] bg-white/[0.03] border border-[#e8ebe6] text-[#0e0f0c]/70 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                    {examInfo.instructions}
                  </div>
                )}

                <ul className="space-y-4 text-sm text-[#0e0f0c]/70 tracking-wide font-medium">
                  {[
                    'Fullscreen mode will be activated automatically upon starting.',
                    'Navigating away from the exam window is strictly prohibited.',
                    'Exceeding 3 violations will result in automatic termination.',
                    'Keyboard shortcuts and special keys are disabled during the session.',
                    'Your progress is continuously synced to the server.',
                    examInfo?.negativeMarkingEnabled ? 'Negative marking is applied for incorrect responses.' : null,
                  ].filter(Boolean).map((rule, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 rounded-[16px] bg-white/[0.02] border border-[#e8ebe6] hover:bg-white/[0.05] transition-colors">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold border border-cyan-500/20">{i + 1}</span>
                      <span className="mt-0.5">{rule}</span>
                    </li>
                  ))}
                </ul>

                {error && (
                  <div className="p-5 rounded-[20px] border border-red-200 bg-red-50 text-red-600 text-sm font-bold flex items-center gap-4">
                    <AlertTriangle size={20} /> {error}
                  </div>
                )}

                <Button
                  onClick={handleStartExam}
                  disabled={!!error || examInfo?.attempted}
                  className="w-full py-4 btn-primary text-base rounded-full shadow-glow-cyan flex items-center justify-center gap-3"
                >
                  <Zap size={20} /> Begin Assessment
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── SUBMITTED ────────────────────────────────────────────────────────────
  if (phase === 'submitted') {
    return (
      <div className="fixed inset-0 bg-[#f9faf6] flex items-center justify-center p-6 font-body">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl z-10">
          <div className={`bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 md:p-12 text-center relative overflow-hidden ${submitResult?.passed ? 'accent-top-green' : 'accent-top-purple'}`}>
            
            {error && !submitResult ? (
              <>
                <div className="w-24 h-24 rounded-[24px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-8 shadow-[inset_0_0_20px_rgba(248,113,113,0.2)]">
                  <AlertTriangle size={40} className="text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-[#0e0f0c] mb-4 font-display tracking-tight">Submission Failed</h2>
                <p className="text-[#868685] mb-8 bg-black/30 rounded-[16px] border border-[#e8ebe6] p-5 shadow-inner">{error}</p>
              </>
            ) : submitResult?.showResult === false ? (
              <>
                <div className="w-24 h-24 rounded-[24px] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-8 shadow-[inset_0_0_20px_rgba(0,245,255,0.2)]">
                  <CheckCircle2 size={40} className="text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-[#0e0f0c] mb-4 font-display tracking-tight">Assessment Submitted</h2>
                <p className="text-[#868685] mb-8 text-sm tracking-wide">Your responses have been securely recorded.</p>
                <div className="bg-white/[0.03] border border-[#e8ebe6] rounded-[16px] p-4 mb-8">
                  <p className="text-cyan-400/80 text-sm font-medium tracking-wide">Evaluation is pending tutor authorization.</p>
                </div>
              </>
            ) : submitResult ? (
              <>
                <h2 className="text-3xl font-bold text-[#0e0f0c] mb-8 font-display tracking-tight">Assessment Report</h2>

                {submitResult.submissionType !== 'manual' && (
                  <div className={`inline-block px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border ${
                    submitResult.submissionType === 'violation' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]' :
                    submitResult.submissionType === 'timeout' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' :
                    'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                  }`}>
                    Auto-Submitted: {submitResult.submissionType}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5 mb-8">
                  <div className="bg-[#f9faf6] border border-[#e8ebe6] rounded-[24px] p-6 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                    <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Score Percentage</p>
                    <p className="text-4xl font-bold text-cyan-500 relative z-10">{submitResult.score}%</p>
                  </div>
                  <div className="bg-[#f9faf6] border border-[#e8ebe6] rounded-[24px] p-6 relative overflow-hidden group hover:border-purple-400 transition-colors">
                    <p className="text-[#868685] text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Marks Obtained</p>
                    <p className="text-4xl font-bold text-purple-500 relative z-10">{submitResult.totalScore}<span className="text-xl text-[#868685] font-medium">/{submitResult.maxMarks}</span></p>
                  </div>
                </div>

                <div className="flex justify-center gap-6 text-xs font-bold tracking-wide mb-10 bg-white/[0.02] border border-[#e8ebe6] rounded-[16px] p-5 shadow-inner">
                  <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 size={16}/> {submitResult.correct} Correct</span>
                  <span className="text-red-400 flex items-center gap-2"><XIcon size={16}/> {submitResult.wrong} Incorrect</span>
                  <span className="text-[#868685] flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-white/40"/> {submitResult.unattempted} Omitted</span>
                </div>

                <div className={`w-full py-4 rounded-full border text-lg font-bold tracking-wide mb-8 ${submitResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {submitResult.passed ? 'Passed Assessment' : 'Failed Assessment'}
                </div>
              </>
            ) : null}

            <Button
              onClick={() => navigate('/s/dashboard')}
              className="w-full py-4 border border-[#e8ebe6] hover:bg-white text-[#0e0f0c] bg-transparent transition-colors rounded-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── EXAM UI ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#f9faf6] flex flex-col select-none font-body">
      {/* Violation Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <ViolationWarning count={violations} maxViolations={MAX_VIOLATIONS} onDismiss={() => setShowWarning(false)} />
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#f9faf6]/80 backdrop-blur-xl z-[90] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f0f1a]/90 backdrop-blur-2xl border border-[#e8ebe6] p-8 md:p-10 rounded-[32px] max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-50 blur-sm rounded-full"></div>
              
              <h2 className="text-2xl font-bold text-[#0e0f0c] mb-6 font-display tracking-tight text-center">Confirm Submission</h2>
              
              <div className="space-y-4 mb-8 text-sm font-medium tracking-wide bg-[#f9faf6] rounded-[20px] p-6 border border-[#e8ebe6]">
                <div className="flex justify-between items-center text-[#868685]">
                  <span>Questions Attempted</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{answeredCount}/{questions.length}</span>
                </div>
                <div className="flex justify-between items-center text-[#868685]">
                  <span>Unanswered</span>
                  <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">{unansweredCount}</span>
                </div>
                <div className="flex justify-between items-center text-[#868685]">
                  <span>Marked for Review</span>
                  <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">{reviewCount}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={() => setShowConfirmSubmit(false)} className="flex-1 py-4 bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] rounded-full transition-all">
                  Cancel
                </Button>
                <Button onClick={handleManualSubmit} disabled={submitting} className="flex-1 py-4 btn-primary rounded-full shadow-glow-cyan disabled:opacity-50 font-bold tracking-wide">
                  {submitting ? 'Submitting...' : 'Submit Now'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="h-[72px] bg-white border-b border-[#e8ebe6] flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-inner hidden md:flex">
             <Book size={18} className="text-cyan-400" />
          </div>
          <span className="text-[#0e0f0c] font-bold font-display tracking-wide hidden md:block">{examInfo?.title}</span>
          <span className="px-3 py-1 bg-white border border-[#e8ebe6] rounded-full text-[10px] font-bold text-[#868685] uppercase tracking-widest">{examInfo?.subject}</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <TimerBar secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest uppercase ${
            violations === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            violations === 1 ? 'bg-amber-50 text-amber-600 border-amber-200' :
            'bg-red-50 text-red-600 border-red-200 animate-pulse'
          }`}>
            <Shield size={14} /> <span className="hidden sm:inline">Violations:</span> {violations}/{MAX_VIOLATIONS}
          </div>
          
          <Button onClick={() => setShowConfirmSubmit(true)} className="px-6 py-2.5 bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] rounded-full text-xs font-bold tracking-wide transition-all hidden md:block">
            Finish
          </Button>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                
        {/* Left: Question Navigator */}
        <div className="w-[300px] bg-white border-r border-[#e8ebe6] p-6 overflow-y-auto hidden lg:flex flex-col shrink-0 relative z-10">
          <QuestionNavigator questions={questions} answers={answers} markedForReview={markedForReview} currentIndex={currentIndex} onSelect={setCurrentIndex} />
          <div className="mt-auto pt-8">
             <Button onClick={() => setShowConfirmSubmit(true)} className="w-full py-4 bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 text-[#0e0f0c] font-bold tracking-wide rounded-[16px] hover:border-cyan-400 transition-all flex items-center justify-center gap-3">
               Submit Assessment <Send size={16} />
             </Button>
          </div>
        </div>

        {/* Right: Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          {currentQ && (
            <div className="max-w-3xl mx-auto space-y-8 bg-white border border-[#e8ebe6] rounded-[32px] p-8 md:p-10 shadow-sm my-4 md:my-8 relative overflow-hidden">
              <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 rounded-full"></div>
              
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#e8ebe6] pb-6 gap-4">
                <h2 className="text-[#868685] text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e8ebe6] shadow-inner">
                    <span className="text-cyan-400 text-sm">{currentIndex + 1}</span>
                  </span>
                  <span>of {questions.length}</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-[10px] font-bold tracking-widest uppercase">
                    +{currentQ.marks} Pts
                  </span>
                  {currentQ.negativeMarks > 0 && (
                    <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold tracking-widest uppercase">
                      -{currentQ.negativeMarks} Pts
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="relative">
                <p className="text-[#0e0f0c] text-lg md:text-xl leading-relaxed font-medium tracking-wide">
                  {currentQ.text}
                </p>
              </div>

              {/* Question Image */}
              {currentQ.questionImage && (
               <div className="p-4 rounded-[20px] border border-[#e8ebe6] bg-black/30 shadow-inner inline-block w-full text-center">
                  <img src={currentQ.questionImage} alt="Reference" className="max-w-full max-h-[300px] object-contain rounded-[12px] inline-block" />
                </div>
              )}

              {/* Options (MCQ & True-False) */}
              {(currentQ.type === 'mcq' || currentQ.type === 'true-false') && (
                <div className="space-y-4 pt-4">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id]?.chosenIndex === optIdx;
                    return (
                      <button key={optIdx} onClick={() => selectOption(currentQ.id, optIdx)} className={`w-full text-left flex items-center p-5 rounded-[20px] transition-all duration-300 border ${isSelected ? 'bg-cyan-50 border-cyan-400 shadow-sm' : 'bg-[#f9faf6] border-[#e8ebe6] hover:border-cyan-200'}`}>
                        <div className={`w-7 h-7 rounded-full border-[2px] flex items-center justify-center shrink-0 transition-colors mr-5 ${isSelected ? 'border-cyan-500' : 'border-[#e8ebe6]'}`}>
                          {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-cyan-500" />}
                        </div>
                        <span className={`text-base font-medium tracking-wide ${isSelected ? 'text-[#0e0f0c]' : 'text-[#868685]'}`}>
                          {currentQ.type === 'mcq' && <span className={`mr-4 font-bold text-sm ${isSelected ? 'text-cyan-600' : 'text-[#868685]'}`}>{String.fromCharCode(65 + optIdx)}.</span>}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {currentQ.type === 'short' && (
                <div className="space-y-4 pt-4">
                  <textarea
                    value={answers[currentQ.id]?.textAnswer || ''}
                    onChange={(e) => setTextAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-[20px] p-6 text-[#0e0f0c] placeholder:text-[#868685] focus:border-cyan-400 focus:shadow-sm outline-none resize-none text-base tracking-wide transition-all"
                  />
                </div>
              )}

              {/* Action Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-6 border-t border-[#e8ebe6] gap-4">
                <div className="flex gap-4 w-full sm:w-auto">
                  <button onClick={() => toggleReview(currentQ.id)} className={`flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex border ${markedForReview.has(currentQ.id) ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-[#868685] border-[#e8ebe6] hover:border-[#868685] hover:text-[#0e0f0c]'}`}>
                    <Flag size={16} /> {markedForReview.has(currentQ.id) ? 'Marked' : 'Mark Review'}
                  </button>
                  <button onClick={() => clearResponse(currentQ.id)} className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#e8ebe6] bg-white text-[#868685] hover:border-[#868685] hover:text-[#0e0f0c] hover:bg-[#f9faf6] text-xs font-bold uppercase tracking-widest transition-all flex">
                    <XIcon size={16} /> Clear
                  </button>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#e8ebe6] bg-white text-[#868685] hover:text-[#0e0f0c] hover:bg-[#f9faf6] text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-30 disabled:hover:bg-white flex">
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)} className="flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-30 flex">
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Bottom Nav ───────────────────────────────────────────── */}
      <div className="lg:hidden h-20 bg-white border-t border-[#e8ebe6] flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="w-12 h-12 rounded-full border border-[#e8ebe6] bg-white flex items-center justify-center text-[#0e0f0c] disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[#868685] text-sm font-bold tracking-widest">
          <span className="text-cyan-400">{currentIndex + 1}</span> / {questions.length}
        </span>
        <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)} className="w-12 h-12 rounded-full border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 disabled:opacity-30 disabled:border-[#e8ebe6] disabled:bg-white disabled:text-[#868685]">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ExamWindow;
