import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import AdminDashboard from './AdminDashboard';
import { upsertSubmission, getSubmissionCount } from '../lib/supabaseDb';
import { 
  BAGIAN_A_QUESTIONS, 
  BAGIAN_B_ESSAYS, 
  MODERATOR_PIN_CODE,
  STORAGE_KEY_SUBMISSIONS,
  STORAGE_KEY_SHEETS_URL
} from '../data/kuisData';

export default function KuisView({ setView }) {
  // Navigation & Screen state: 'start' | 'mc' | 'transition' | 'essay' | 'results' | 'admin'
  const [screen, setScreen] = useState('start');
  const [previousScreenBeforeAdmin, setPreviousScreenBeforeAdmin] = useState('start');
  const [playerName, setPlayerName] = useState('');
  const [playerClass, setPlayerClass] = useState('');
  const [onboardingError, setOnboardingError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Bagian A (Multiple Choice)
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelectedLetter, setMcSelectedLetter] = useState(null);
  const [mcLocked, setMcLocked] = useState(false);
  const [mcEliminatedLetters, setMcEliminatedLetters] = useState([]);
  const [mcHintShown, setMcHintShown] = useState(false);
  const [mcAnswers, setMcAnswers] = useState([]); // array of answer records

  // Lifelines
  const [lifeline50, setLifeline50] = useState(2);
  const [lifelineHint, setLifelineHint] = useState(2);

  // Bagian B (Essays 9 & 10)
  const [essayIndex, setEssayIndex] = useState(0);
  const [essayLocked, setEssayLocked] = useState(false);
  const [essayAnswers, setEssayAnswers] = useState({
    9: { part1: '', part2: '', earnedXp: 0, rubricCount: 0 },
    10: { part1: '', part2: '', earnedXp: 0, rubricCount: 0 }
  });

  // Metrics
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [submissionId, setSubmissionId] = useState('');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('saved'); // 'saving' | 'saved' | 'sheets_ok' | 'local_only'

  // Modals
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinText, setShowPinText] = useState(false);
  const [reviewTab, setReviewTab] = useState('all'); // 'all' | 'bagianA' | 'bagianB'
  const [copiedReport, setCopiedReport] = useState(false);

  // Audio & Persistence
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const audioCtxRef = useRef(null);
  const formCardRef = useRef(null);

  // Load submissions count on mount (Supabase + localStorage fallback)
  useEffect(() => {
    let localCount = 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localCount = parsed.length;
          setSubmissionsCount(localCount);
        }
      }
    } catch (e) {}

    getSubmissionCount()
      .then(remoteCount => {
        if (typeof remoteCount === 'number') {
          setSubmissionsCount(Math.max(remoteCount, localCount));
        }
      })
      .catch(() => {});
  }, []);

  // Web Audio API Synthesizer
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.09);
        osc.frequency.setValueAtTime(783.99, now + 0.18);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(155, now + 0.25);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, now + idx * 0.1);
          g.gain.setValueAtTime(0.12, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.32);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.32);
        });
      }
    } catch (err) {}
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen === 'mc') {
        const key = e.key.toUpperCase();
        const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        const letter = numMap[key] || (['A', 'B', 'C', 'D'].includes(key) ? key : null);

        if (letter && !mcLocked) {
          e.preventDefault();
          selectMcOption(letter);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (!mcLocked && mcSelectedLetter) {
            checkMcAnswer();
          } else if (mcLocked) {
            nextMcQuestion();
          }
        } else if (key === 'F' && !mcLocked) {
          e.preventDefault();
          useFiftyFifty();
        } else if (key === 'H' && !mcLocked) {
          e.preventDefault();
          useHint();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, mcLocked, mcSelectedLetter, mcIndex, lifeline50, lifelineHint]);

  // Start Quiz
  const handleStartQuiz = () => {
    const nameVal = playerName.trim();
    const classVal = playerClass.trim();

    if (!nameVal || !classVal) {
      playSound('wrong');
      setOnboardingError(
        !nameVal && !classVal
          ? 'Mohon isi Nama Lengkap dan Program Studi / Kelas terlebih dahulu.'
          : (!nameVal ? 'Mohon isi Nama Lengkap kamu terlebih dahulu.' : 'Mohon isi Program Studi / Kelas (contoh: Matematika/SS18).')
      );
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setOnboardingError('');
    setMcIndex(0);
    setMcSelectedLetter(null);
    setMcLocked(false);
    setMcEliminatedLetters([]);
    setMcHintShown(false);
    setMcAnswers([]);
    setEssayIndex(0);
    setEssayLocked(false);
    setEssayAnswers({
      9: { part1: '', part2: '', earnedXp: 0, rubricCount: 0 },
      10: { part1: '', part2: '', earnedXp: 0, rubricCount: 0 }
    });
    setXp(0);
    setStreak(0);
    setMaxStreak(0);
    setLifeline50(2);
    setLifelineHint(2);
    setSubmissionId('CQ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());

    playSound('powerup');
    setScreen('mc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Option selection
  const selectMcOption = (letter) => {
    if (mcLocked || mcEliminatedLetters.includes(letter)) return;
    playSound('click');
    setMcSelectedLetter(letter);
  };

  // Lifelines
  const useFiftyFifty = () => {
    if (mcLocked || lifeline50 <= 0 || mcEliminatedLetters.length > 0) return;
    const q = BAGIAN_A_QUESTIONS[mcIndex];
    if (!q) return;

    playSound('powerup');
    setLifeline50(prev => prev - 1);

    const wrongLetters = q.options
      .map(o => o.letter)
      .filter(l => l !== q.correctLetter);

    // Shuffle and pick 2
    const shuffled = [...wrongLetters].sort(() => 0.5 - Math.random());
    const eliminated = shuffled.slice(0, 2);
    setMcEliminatedLetters(eliminated);

    if (mcSelectedLetter && eliminated.includes(mcSelectedLetter)) {
      setMcSelectedLetter(null);
    }
  };

  const useHint = () => {
    if (mcLocked || lifelineHint <= 0 || mcHintShown) return;
    playSound('powerup');
    setLifelineHint(prev => prev - 1);
    setMcHintShown(true);
  };

  // Check MCQ Answer
  const checkMcAnswer = () => {
    if (mcLocked || !mcSelectedLetter) return;
    const q = BAGIAN_A_QUESTIONS[mcIndex];
    if (!q) return;

    setMcLocked(true);
    const isCorrect = mcSelectedLetter === q.correctLetter;
    let earnedXp = 0;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      const streakBonus = (newStreak - 1) * 15;
      earnedXp = 100 + streakBonus;
      setXp(prev => prev + earnedXp);
      playSound('correct');
    } else {
      setStreak(0);
      playSound('wrong');
    }

    setMcAnswers(prev => {
      const copy = [...prev];
      copy[mcIndex] = {
        questionId: q.id,
        selectedLetter: mcSelectedLetter,
        correctLetter: q.correctLetter,
        isCorrect,
        earnedXp
      };
      return copy;
    });
  };

  const nextMcQuestion = () => {
    playSound('click');
    if (mcIndex < BAGIAN_A_QUESTIONS.length - 1) {
      setMcIndex(prev => prev + 1);
      setMcSelectedLetter(null);
      setMcLocked(false);
      setMcEliminatedLetters([]);
      setMcHintShown(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScreen('transition');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Essay Studio Logic
  const handleEssayChange = (part, text) => {
    if (essayLocked) return;
    const item = BAGIAN_B_ESSAYS[essayIndex];
    setEssayAnswers(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        [part]: text
      }
    }));
  };

  const insertPromptChip = (chipIdx) => {
    if (essayLocked) return;
    const item = BAGIAN_B_ESSAYS[essayIndex];
    const chip = item.chips[chipIdx];
    if (!chip) return;

    playSound('click');
    const targetPart = chipIdx < 2 ? 'part1' : 'part2';
    const currentVal = essayAnswers[item.id]?.[targetPart] || '';
    const newVal = currentVal.trim() ? `${currentVal} ${chip.snippet}` : chip.snippet;

    setEssayAnswers(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        [targetPart]: newVal
      }
    }));
  };

  // Real-time quality evaluation
  const curEssay = BAGIAN_B_ESSAYS[essayIndex];
  const curAns = essayAnswers[curEssay?.id] || { part1: '', part2: '' };
  const combinedText = `${curAns.part1} ${curAns.part2}`.toLowerCase();
  const wordCount = combinedText.split(/\s+/).filter(Boolean).length;
  const hasDepth = wordCount >= 25;
  const hasConcept = curEssay ? curEssay.keywords.some(kw => combinedText.includes(kw)) : false;
  const hasAction = (curAns.part2 || '').trim().length >= 25;
  const hasBoth = (curAns.part1 || '').trim().length >= 12 && (curAns.part2 || '').trim().length >= 12;
  const passedCount = [hasDepth, hasConcept, hasAction, hasBoth].filter(Boolean).length;
  const previewXp = hasBoth ? (100 + passedCount * 35) : 0;

  const submitEssay = () => {
    if (essayLocked) return;
    if ((curAns.part1 || '').trim().length < 8 || (curAns.part2 || '').trim().length < 8) {
      playSound('wrong');
      return;
    }

    setEssayLocked(true);
    const earnedXp = Math.max(150, previewXp);
    setXp(prev => prev + earnedXp);

    setEssayAnswers(prev => ({
      ...prev,
      [curEssay.id]: {
        ...prev[curEssay.id],
        earnedXp,
        rubricCount: passedCount
      }
    }));

    playSound('correct');
  };

  const nextEssayQuestion = () => {
    playSound('click');
    if (essayIndex < BAGIAN_B_ESSAYS.length - 1) {
      setEssayIndex(prev => prev + 1);
      setEssayLocked(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finishQuiz();
    }
  };

  // Complete Quiz & Auto Save
  const finishQuiz = () => {
    playSound('victory');
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.6 }
    });

    const correctMcCount = mcAnswers.filter(a => a && a.isCorrect).length;
    const pct = Math.round((correctMcCount / 8) * 100);
    const now = new Date();
    const wib = now.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const detailedMcq = BAGIAN_A_QUESTIONS.map((q, idx) => {
      const rec = mcAnswers[idx] || { selectedLetter: '-', isCorrect: false, earnedXp: 0 };
      const opt = q.options.find(o => o.letter === rec.selectedLetter);
      return {
        questionId: q.id,
        selectedOption: rec.selectedLetter,
        selectedText: opt ? opt.text : '-',
        correctOption: q.correctLetter,
        isCorrect: Boolean(rec.isCorrect),
        earnedXp: rec.earnedXp || 0
      };
    });

    const e9 = essayAnswers[9] || { part1: '', part2: '', earnedXp: 0 };
    const e10 = essayAnswers[10] || { part1: '', part2: '', earnedXp: 0 };

    const newSub = {
      id: submissionId || ('CQ-' + now.getTime()),
      docId: submissionId || ('CQ-' + now.getTime()),
      studentName: playerName || 'Mahasiswa',
      studentClass: playerClass || 'Matematika/SS18',
      mcqScore: correctMcCount,
      mcqPercentage: pct,
      xp: xp + (curEssay?.id === 10 ? Math.max(150, previewXp) : 0),
      baseXp: xp + (curEssay?.id === 10 ? Math.max(150, previewXp) : 0),
      maxStreak,
      mcqAnswers: detailedMcq,
      essay9: {
        part1_mengapa_apatis: e9.part1 || '',
        part2_dua_tindakan: e9.part2 || '',
        earnedXp: e9.earnedXp || 0,
        moderatorScore: 0,
        moderatorComment: ''
      },
      essay10: {
        part1_bentuk_apatisme: e10.part1 || '',
        part2_aksi_dan_alasan: e10.part2 || '',
        earnedXp: e10.earnedXp || 0,
        moderatorScore: 0,
        moderatorComment: ''
      },
      moderatorReviewed: false,
      submittedAt: now.toISOString(),
      submittedAtMs: now.getTime(),
      submittedAtWIB: wib
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [newSub, ...existing.filter(s => (s.id || s.docId) !== newSub.id)];
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
      setSubmissionsCount(updated.length);

      setCloudSyncStatus('saving');

      // 1. Kirim ke Supabase (primary cloud database)
      upsertSubmission(newSub)
        .then(ok => {
          if (ok) {
            setCloudSyncStatus('supabase_ok');
          } else {
            setCloudSyncStatus('local_only');
          }
        })
        .catch(() => setCloudSyncStatus('local_only'));

      // 2. Kirim ke Google Sheets jika URL dikonfigurasi (secondary fallback)
      const sheetsUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
      if (sheetsUrl && sheetsUrl.startsWith('https://script.google.com/')) {
        fetch(sheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitQuiz',
            id: newSub.id,
            timestamp: newSub.submittedAtWIB,
            name: newSub.studentName,
            prodi: newSub.studentClass,
            mcScore: `${newSub.mcqScore}/8 (${newSub.mcqPercentage}%)`,
            xp: newSub.xp,
            mcAnswers: detailedMcq.reduce((acc, cur) => {
              acc[`Q${cur.questionId}`] = `${cur.selectedOption} (${cur.isCorrect ? 'Benar' : 'Salah'})`;
              return acc;
            }, {}),
            essay9: `[Mengapa Apatis]: ${e9.part1} | [2 Tindakan]: ${e9.part2}`,
            essay10: `[Bentuk Apatisme]: ${e10.part1} | [Aksi & Harapan]: ${e10.part2}`,
            modScore9: 0,
            modComment9: '',
            modScore10: 0,
            modComment10: '',
            gradedByMod: false,
            rawSubmission: newSub
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
      setCloudSyncStatus('local_only');
    }

    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy Full Result Sheet
  const copyResultReport = () => {
    playSound('click');
    const correctCount = mcAnswers.filter(a => a && a.isCorrect).length;
    const pct = Math.round((correctCount / 8) * 100);
    const e9 = essayAnswers[9] || { part1: '-', part2: '-' };
    const e10 = essayAnswers[10] || { part1: '-', part2: '-' };

    const lines = [
      '==========================================',
      'LAPORAN HASIL KUIS: CIVIC QUEST',
      'Topik: Apatisme Publik & Demokrasi',
      '==========================================',
      `Nama Lengkap          : ${playerName}`,
      `Program Studi / Kelas : ${playerClass}`,
      `Skor Bagian A (PG)    : ${correctCount}/8 (${pct}%)`,
      `Total XP              : ${xp} XP`,
      '------------------------------------------',
      'BAGIAN A — PILIHAN GANDA (1–8)',
      '------------------------------------------'
    ];

    BAGIAN_A_QUESTIONS.forEach((q, idx) => {
      const rec = mcAnswers[idx] || { selectedLetter: '-', isCorrect: false };
      lines.push(`Soal ${q.id}: Jawaban ${rec.selectedLetter} (${rec.isCorrect ? 'Benar' : 'Salah, Kunci: ' + q.correctLetter})`);
    });

    lines.push(
      '------------------------------------------',
      'BAGIAN B — ISIAN & STUDI KASUS (9–10)',
      '------------------------------------------',
      '[Soal 9.1 - Mengapa mendorong apatisme politik?]',
      e9.part1 || '-',
      '',
      '[Soal 9.2 - Dua tindakan konkret mahasiswa]',
      e9.part2 || '-',
      '',
      '[Soal 10.1 - Bentuk apatisme di lingkungan mahasiswa]',
      e10.part1 || '-',
      '',
      '[Soal 10.2 - Aksi edukasi kampus, alasan & harapan]',
      e10.part2 || '-',
      '=========================================='
    );

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Verify Admin PIN (PIN: kel8juara preserved)
  const handleVerifyPin = () => {
    if (pinInput.trim() === MODERATOR_PIN_CODE) {
      playSound('powerup');
      setShowPinModal(false);
      setPinError(false);
      setPinInput('');
      sessionStorage.setItem('dikwar_admin_auth', 'true');
      setPreviousScreenBeforeAdmin(screen);
      setScreen('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      playSound('wrong');
      setPinError(true);
    }
  };

  // Header Calculations
  let stepNum = 1;
  let stageLabel = 'BAGIAN A';
  if (screen === 'mc') {
    stepNum = mcIndex + 1;
    stageLabel = 'BAGIAN A';
  } else if (screen === 'transition') {
    stepNum = 8;
    stageLabel = 'BAGIAN A SELESAI';
  } else if (screen === 'essay') {
    stepNum = 9 + essayIndex;
    stageLabel = 'BAGIAN B';
  } else if (screen === 'results') {
    stepNum = 10;
    stageLabel = 'SELESAI';
  }
  const progressPct = Math.min(100, Math.round((stepNum / 10) * 100));
  const isInQuiz = ['mc', 'transition', 'essay'].includes(screen);

  const curQ = BAGIAN_A_QUESTIONS[mcIndex];
  const optionColors = {
    A: 'bg-indigo-600 text-white',
    B: 'bg-cyan-600 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-rose-500 text-white'
  };

  const correctMcCount = mcAnswers.filter(a => a && a.isCorrect).length;
  const mcPct = Math.round((correctMcCount / 8) * 100);

  let civicTitle = 'Predikat: Warga Kampus Peduli Demokrasi';
  let civicGrade = 'B+';
  if (correctMcCount >= 7) {
    civicTitle = 'Predikat: Arsitek Demokrasi & Pengawal Kebijakan Publik';
    civicGrade = 'A+';
  } else if (correctMcCount >= 5) {
    civicTitle = 'Predikat: Analis Kebijakan Kritis & Partisipatif';
    civicGrade = 'A';
  }

  // When admin dashboard is opened from the quiz HUD
  if (screen === 'admin') {
    return (
      <AdminDashboard
        setView={setView}
        onClose={() => {
          setScreen(previousScreenBeforeAdmin || 'start');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="gamified-bg min-h-screen text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white flex flex-col justify-between">

      {/* TOP STICKY GAMIFIED HUD */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">

          {/* Brand Logo & Quest Title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                if (screen !== 'start') setShowResetModal(true);
              }}
              className="flex items-center gap-2.5 group focus:outline-none cursor-pointer text-left"
              title="Kembali ke Beranda Kuis"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <span className="font-quest font-bold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">
                  CIVIC<span className="text-indigo-600 dark:text-indigo-400">QUEST</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 block mt-0.5">
                  Apatisme Publik &amp; Demokrasi
                </span>
              </div>
            </button>
          </div>

          {/* Center HUD: Progress Bar (Visible during Quiz) */}
          {isInQuiz && (
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-4">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold shrink-0">
                {stageLabel}
              </span>
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {stepNum}/10
              </span>
            </div>
          )}

          {/* Right HUD: Student Pill, Streak, XP, Article Sheet, Moderator, Sound */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Student Profile Pill */}
            {playerName && screen !== 'start' && (
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 font-sans text-xs font-bold max-w-[240px] truncate"
                title="Identitas Peserta Kuis"
              >
                <span className="text-sm leading-none">🎓</span>
                <span className="truncate">{playerName} • {playerClass}</span>
              </div>
            )}

            {/* Combo Streak Counter */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700/70 text-amber-700 dark:text-amber-300 font-mono text-xs font-extrabold transition-transform">
              <span className="text-sm leading-none">🔥</span>
              <span>{streak}</span>
            </div>

            {/* XP Score Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700/70 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-extrabold">
              <span className="text-sm leading-none">⚡</span>
              <span>{xp}</span>
              <span className="text-[10px]">XP</span>
            </div>

            {/* Quick Article Reference Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowArticleModal(true);
              }}
              className="btn-3d btn-3d-neutral px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              title="Buka Intisari Materi Artikel"
            >
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span className="hidden sm:inline">Ringkasan Artikel</span>
            </button>

            {/* Dashboard Admin Button (PIN: kel8juara) */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowPinModal(true);
              }}
              className="btn-3d btn-3d-amber px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              title="Buka Dashboard Admin (Rekap Jawaban Mahasiswa)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span className="hidden sm:inline">Dashboard Admin</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-900/30 text-white font-mono text-[10px]">{submissionsCount}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(prev => !prev);
                if (!soundEnabled) playSound('click');
              }}
              className="btn-3d btn-3d-neutral p-2 rounded-xl"
              title="Suara Efek Interaktif (Aktif/Bisu)"
              aria-label="Toggle Suara"
            >
              {soundEnabled ? (
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Progress Bar */}
        {isInQuiz && (
          <div className="md:hidden px-4 pb-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
              <span className="text-indigo-600 dark:text-indigo-400">{stageLabel} — {stepNum <= 8 ? 'PILIHAN GANDA' : 'STUDI KASUS'}</span>
              <span className="text-slate-500">Soal {stepNum} / 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* MAIN APPLICATION CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* ===================================================================
             SCREEN 1: START SCREEN (ONBOARDING & PLAYER SETUP)
             =================================================================== */}
        {screen === 'start' && (
          <section className="animate-pop-in space-y-8">
            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl overflow-hidden">
              <div className="hidden lg:block absolute -right-10 -top-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="hidden lg:block absolute right-12 bottom-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-extrabold uppercase tracking-wider">
                      🎯 Interactive Civic Challenge
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                      8 Pilihan Ganda + 2 Studi Kasus
                    </span>
                  </div>

                  <h1 className="font-quest font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white leading-[1.12] tracking-tight">
                    Apatisme Publik: <span className="text-indigo-600 dark:text-indigo-400">Ketika Suara Masyarakat</span> Diuji!
                  </h1>

                  <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
                    Uji ketajaman analisismu tentang <strong>demokrasi pasca-bilik suara</strong>, temuan riset pemuda <strong>Putri, Marlina, &amp; Zain (2025)</strong>, konsep <strong>Political Efficacy</strong>, hingga jaminan hukum <strong>Meaningful Participation</strong> dalam pengalaman kuis interaktif.
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 text-center">
                      <span className="text-xl block">⚡</span>
                      <span className="font-quest font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 block">Combo &amp; XP</span>
                      <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Streak Multiplier</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 text-center">
                      <span className="text-xl block">🛡️</span>
                      <span className="font-quest font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 block">2 Power-Ups</span>
                      <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">50:50 &amp; Petunjuk</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 text-center">
                      <span className="text-xl block">🧠</span>
                      <span className="font-quest font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1 block">Think-Tank</span>
                      <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Radar Analisis Esai</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Setup Card (5 cols) */}
                <div
                  ref={formCardRef}
                  className={`lg:col-span-5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-6 sm:p-7 border-2 border-slate-200 dark:border-slate-700 space-y-5 ${isShaking ? 'animate-shake' : ''}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <h2 className="font-quest font-bold text-xl text-slate-900 dark:text-white">
                        Identitas Peserta Kuis
                      </h2>
                      <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Data otomatis direkam ke rekap kelas
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 font-extrabold">
                      Wajib Diisi
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setOnboardingError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                      placeholder="Contoh: Nadia Maharani"
                      maxLength={60}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none font-sans text-sm font-semibold text-slate-900 dark:text-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Program Studi / Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerClass}
                      onChange={(e) => {
                        setPlayerClass(e.target.value);
                        setOnboardingError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
                      placeholder="Matematika/SS18"
                      maxLength={60}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-none font-sans text-sm font-semibold text-slate-900 dark:text-white transition-colors"
                    />
                  </div>

                  {onboardingError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 font-sans text-xs font-bold flex items-center gap-2 animate-shake">
                      <span>⚠️</span>
                      <span>{onboardingError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="btn-3d btn-3d-indigo w-full py-4 px-6 rounded-2xl font-quest font-bold text-base sm:text-lg tracking-wide flex items-center justify-center gap-2.5"
                  >
                    <span>🚀 Mulai Tantangan (10 Soal)</span>
                  </button>

                  <p className="text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    💡 Pintasan Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">D</kbd> &amp; <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">Enter ↵</kbd>
                  </p>
                </div>
              </div>
            </div>

            {/* Structure Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-quest font-bold text-xl shrink-0">
                  A
                </div>
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Bagian A • Soal 1 – 8</span>
                  <h3 className="font-quest font-bold text-lg text-slate-900 dark:text-white mt-0.5">Arena Pilihan Ganda</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    8 soal skenario dan konsep kunci tentang apatisme vs sikap kritis, riset pemuda 2025, <em>political efficacy</em>, tahapan kebijakan publik, Pasal 96 UU 13/2022, dan <em>meaningful participation</em>.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-quest font-bold text-xl shrink-0">
                  B
                </div>
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Bagian B • Soal 9 – 10</span>
                  <h3 className="font-quest font-bold text-lg text-slate-900 dark:text-white mt-0.5">Studio Isian: Analisis Kasus &amp; Proyeksi Aksi</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    2 tantangan esai reflektif dilengkapi <strong>Radar Kualitas Argumen Real-Time</strong>, kartu pemantik konsep, serta perbandingan langsung dengan referensi jawaban ideal.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================
             SCREEN 2: BAGIAN A — MULTIPLE CHOICE (SOAL 1 - 8)
             =================================================================== */}
        {screen === 'mc' && curQ && (
          <section className="animate-pop-in space-y-6">
            {/* Meta & Lifelines Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-quest font-bold text-sm">
                  SOAL {curQ.id} / 8
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {curQ.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={useFiftyFifty}
                  disabled={mcLocked || lifeline50 <= 0 || mcEliminatedLetters.length > 0}
                  className="btn-3d btn-3d-neutral px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  title="Eliminasi 2 Pilihan Jawaban yang Salah (Pintasan: F)"
                >
                  <span>✂️ 50:50</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">{lifeline50}x</span>
                </button>

                <button
                  type="button"
                  onClick={useHint}
                  disabled={mcLocked || lifelineHint <= 0 || mcHintShown}
                  className="btn-3d btn-3d-neutral px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  title="Tampilkan Petunjuk Konsep Artikel (Pintasan: H)"
                >
                  <span>💡 Petunjuk</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[11px]">{lifelineHint}x</span>
                </button>
              </div>
            </div>

            {/* Active Concept Hint Banner */}
            {mcHintShown && (
              <div className="animate-pop-in p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">💡</span>
                <div className="text-xs sm:text-sm space-y-0.5">
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                    Petunjuk Konsep Artikel:
                  </span>
                  <p className="font-medium leading-relaxed">{curQ.hint}</p>
                </div>
              </div>
            )}

            {/* Main Question Prompt Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-indigo-600 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                  {curQ.scenario}
                </div>
                <h2 className="font-quest font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
                  {curQ.id}. {curQ.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {curQ.options.map(opt => {
                  const isEliminated = mcEliminatedLetters.includes(opt.letter);
                  const isSelected = mcSelectedLetter === opt.letter;
                  const isCorrect = opt.letter === curQ.correctLetter;

                  let cardClass = 'option-card-3d w-full p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 flex items-start gap-3.5 text-left';
                  if (isEliminated) {
                    cardClass += ' opacity-30 pointer-events-none line-through';
                  } else if (mcLocked) {
                    cardClass += ' locked-option';
                    if (isCorrect) {
                      cardClass += ' correct-option';
                    } else if (isSelected) {
                      cardClass += ' wrong-option';
                    }
                  } else if (isSelected) {
                    cardClass += ' selected-option';
                  }

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      disabled={mcLocked || isEliminated}
                      onClick={() => selectMcOption(opt.letter)}
                      className={cardClass}
                    >
                      <span className={`w-9 h-9 rounded-xl ${optionColors[opt.letter]} font-quest font-bold text-base flex items-center justify-center shrink-0 mt-0.5`}>
                        {opt.letter}
                      </span>
                      <span className="font-sans text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Pilih satu jawaban lalu tekan <strong>PERIKSA JAWABAN</strong> (atau tombol Enter ↵)
                </span>
                <button
                  type="button"
                  onClick={checkMcAnswer}
                  disabled={mcLocked || !mcSelectedLetter}
                  className="btn-3d btn-3d-indigo w-full sm:w-auto ml-auto px-8 py-3.5 rounded-2xl font-quest font-bold text-base tracking-wide flex items-center justify-center gap-2"
                >
                  <span>PERIKSA JAWABAN</span>
                  <span className="font-mono text-xs opacity-80">[Enter ↵]</span>
                </button>
              </div>
            </div>

            {/* Instant Feedback Drawer */}
            {mcLocked && (
              <div className={`animate-pop-in rounded-3xl border-2 p-6 sm:p-8 shadow-xl space-y-4 ${
                mcSelectedLetter === curQ.correctLetter
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                      mcSelectedLetter === curQ.correctLetter ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {mcSelectedLetter === curQ.correctLetter ? '✓' : '✕'}
                    </div>
                    <div>
                      <span className={`font-mono text-xs font-extrabold uppercase tracking-wider block ${
                        mcSelectedLetter === curQ.correctLetter ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                      }`}>
                        {mcSelectedLetter === curQ.correctLetter
                          ? `+${100 + (streak - 1) * 15} XP • STREAK ${streak}x 🔥`
                          : `JAWABAN TEPAT ADALAH OPSI ${curQ.correctLetter}`}
                      </span>
                      <h3 className="font-quest font-bold text-2xl text-slate-900 dark:text-white">
                        {mcSelectedLetter === curQ.correctLetter ? 'Tepat Sekali! Analisis Tajam.' : 'Belum Tepat — Mari Pelajari Konsepnya!'}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextMcQuestion}
                    className="btn-3d btn-3d-emerald px-7 py-3.5 rounded-2xl font-quest font-bold text-base tracking-wide flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>
                      {mcIndex < BAGIAN_A_QUESTIONS.length - 1 ? `SOAL BERIKUTNYA (${mcIndex + 2}/8)` : 'SELESAIKAN BAGIAN A'}
                    </span>
                    <span>→</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    📖 Mengapa Demikian? (Insight Artikel):
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {curQ.explanation}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
             SCREEN 3: STAGE TRANSITION (BAGIAN A -> BAGIAN B)
             =================================================================== */}
        {screen === 'transition' && (
          <section className="animate-pop-in">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center text-4xl animate-float shadow-md">
                🏛️
              </div>
              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-extrabold uppercase">
                  BAGIAN A SELESAI!
                </span>
                <h2 className="font-quest font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                  Selamat Datang di Bagian B: <br/>
                  <span className="text-indigo-600 dark:text-indigo-400">Studio Analisis Kasus &amp; Proyeksi Aksi</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Kamu telah menyelesaikan 8 soal Pilihan Ganda dengan skor sementara <strong className="text-indigo-600 dark:text-indigo-400">{correctMcCount}/8 ({mcPct}%)</strong>. Sekarang saatnya menguji daya kritis dan gagasan aksimu pada <strong>Soal 9 (Analisis Kasus)</strong> dan <strong>Soal 10 (Refleksi &amp; Proyeksi Aksi)</strong>!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-[11px] text-slate-500 block">Akurasi PG</span>
                  <span className="font-quest font-bold text-xl text-slate-900 dark:text-white">{mcPct}%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-[11px] text-slate-500 block">XP Terkumpul</span>
                  <span className="font-quest font-bold text-xl text-emerald-600 dark:text-emerald-400">{xp} XP</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-[11px] text-slate-500 block">Rekor Streak</span>
                  <span className="font-quest font-bold text-xl text-amber-500">{maxStreak}x 🔥</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('powerup');
                  setScreen('essay');
                  setEssayIndex(0);
                  setEssayLocked(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-3d btn-3d-indigo px-8 py-4 rounded-2xl font-quest font-bold text-lg tracking-wide inline-flex items-center gap-3"
              >
                <span>MASUK KE BAGIAN B (SOAL 9 &amp; 10)</span>
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================
             SCREEN 4: BAGIAN B — ESSAY STUDIO (SOAL 9 & 10)
             =================================================================== */}
        {screen === 'essay' && curEssay && (
          <section className="animate-pop-in space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-quest font-bold text-sm">
                  BAGIAN B • SOAL {curEssay.id}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  {curEssay.category}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>⚡ Potensi Bonus: Hingga +250 XP</span>
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-indigo-600 space-y-3">
                <h2 className="font-quest font-bold text-lg sm:text-xl text-indigo-700 dark:text-indigo-300">
                  {curEssay.title}
                </h2>
                {curEssay.promptText.split('\n').map((line, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              {/* Clickable Concept Inspiration Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    💡 Klik Kartu Pemantik Konsep (Menambahkan Kata Kunci ke Jawabanmu):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {curEssay.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={essayLocked}
                      onClick={() => insertPromptChip(idx)}
                      className="btn-3d btn-3d-neutral px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300"
                    >
                      <span>+ {chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Inputs */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block font-quest font-bold text-base text-slate-900 dark:text-white">
                    {curEssay.subLabel1}
                  </label>
                  <textarea
                    rows={4}
                    disabled={essayLocked}
                    value={curAns.part1}
                    onChange={(e) => handleEssayChange('part1', e.target.value)}
                    placeholder={curEssay.placeholder1}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-sans text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-quest font-bold text-base text-slate-900 dark:text-white">
                    {curEssay.subLabel2}
                  </label>
                  <textarea
                    rows={4}
                    disabled={essayLocked}
                    value={curAns.part2}
                    onChange={(e) => handleEssayChange('part2', e.target.value)}
                    placeholder={curEssay.placeholder2}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-sans text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed transition-colors"
                  />
                </div>
              </div>

              {/* Real-time argument quality radar */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📡</span>
                    <span className="font-quest font-bold text-sm text-slate-900 dark:text-white">
                      Radar Kualitas Argumen (Real-Time)
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-extrabold">
                    +{previewXp} XP Terdeteksi ({wordCount} kata)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${hasDepth ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-50'} flex items-center gap-2 transition-all`}>
                    <span className={`w-5 h-5 rounded-full ${hasDepth ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'} text-xs flex items-center justify-center font-bold`}>
                      {hasDepth ? '✓' : '1'}
                    </span>
                    <div className="min-w-0">
                      <span className="font-sans font-bold text-xs block truncate">Kedalaman Analisis</span>
                      <span className="font-mono text-[10px] text-slate-500 block">Min. 25 kata</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${hasConcept ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-50'} flex items-center gap-2 transition-all`}>
                    <span className={`w-5 h-5 rounded-full ${hasConcept ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'} text-xs flex items-center justify-center font-bold`}>
                      {hasConcept ? '✓' : '2'}
                    </span>
                    <div className="min-w-0">
                      <span className="font-sans font-bold text-xs block truncate">Konsep Artikel</span>
                      <span className="font-mono text-[10px] text-slate-500 block">Efikasi / Hak</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${hasAction ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-50'} flex items-center gap-2 transition-all`}>
                    <span className={`w-5 h-5 rounded-full ${hasAction ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'} text-xs flex items-center justify-center font-bold`}>
                      {hasAction ? '✓' : '3'}
                    </span>
                    <div className="min-w-0">
                      <span className="font-sans font-bold text-xs block truncate">Solusi Konkret</span>
                      <span className="font-mono text-[10px] text-slate-500 block">Langkah Nyata</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${hasBoth ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-50'} flex items-center gap-2 transition-all`}>
                    <span className={`w-5 h-5 rounded-full ${hasBoth ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'} text-xs flex items-center justify-center font-bold`}>
                      {hasBoth ? '✓' : '4'}
                    </span>
                    <div className="min-w-0">
                      <span className="font-sans font-bold text-xs block truncate">Dua Bagian Terisi</span>
                      <span className="font-mono text-[10px] text-slate-500 block">Lengkap &amp; Utuh</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
                  {essayLocked ? '✓ Jawaban terkunci! Bandingkan argumenmu dengan referensi artikel di bawah.' : 'Isi kedua kolom analisis di atas (minimal beberapa kalimat) untuk mengunci jawaban.'}
                </span>
                <button
                  type="button"
                  disabled={essayLocked || (curAns.part1 || '').trim().length < 8 || (curAns.part2 || '').trim().length < 8}
                  onClick={submitEssay}
                  className="btn-3d btn-3d-indigo px-8 py-3.5 rounded-2xl font-quest font-bold text-base tracking-wide flex items-center justify-center gap-2 shrink-0"
                >
                  <span>KUNCI JAWABAN &amp; LIHAT REFERENSI</span>
                  <span>✓</span>
                </button>
              </div>
            </div>

            {/* Benchmark Model Answer Feedback Card */}
            {essayLocked && (
              <div className="animate-pop-in rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-400 dark:border-emerald-600 p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 dark:border-emerald-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                      🌟
                    </div>
                    <div>
                      <span className="font-mono text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-300 block">
                        +{Math.max(150, previewXp)} XP • ANALISIS TERSIMPAN
                      </span>
                      <h3 className="font-quest font-bold text-2xl text-slate-900 dark:text-white">
                        Refleksi Kritis yang Sangat Baik!
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextEssayQuestion}
                    className="btn-3d btn-3d-emerald px-7 py-3.5 rounded-2xl font-quest font-bold text-base tracking-wide flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>{essayIndex < BAGIAN_B_ESSAYS.length - 1 ? 'LANJUT KE SOAL 10' : 'LIHAT SERTIFIKAT & HASIL AKHIR'}</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    📌 Referensi Analisis Ideal Berdasarkan Artikel (Sebagai Pembanding):
                  </span>
                  <div
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2.5 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: curEssay.benchmarkHtml }}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
             SCREEN 5: RESULTS & CIVIC CERTIFICATE
             =================================================================== */}
        {screen === 'results' && (
          <section className="animate-pop-in space-y-8">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
              {/* Certificate Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center text-4xl shadow-lg shrink-0">
                    🏆
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-extrabold uppercase">
                        SERTIFIKAT PENCAPAIAN CIVIC QUEST
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-extrabold">
                        {playerClass || 'Matematika/SS18'}
                      </span>
                    </div>
                    <h2 className="font-quest font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                      {playerName || 'Mahasiswa Kritis'}
                    </h2>
                    <p className="font-sans font-bold text-base text-emerald-600 dark:text-emerald-400">
                      {civicTitle}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center shadow-md shrink-0">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-indigo-200 block">TOTAL SKOR AKHIR</span>
                  <span className="font-quest font-bold text-4xl sm:text-5xl block mt-0.5">{xp} XP</span>
                  <span className="font-mono text-xs text-emerald-300 block mt-1">Pilihan Ganda: {correctMcCount}/8 ({mcPct}%)</span>
                </div>
              </div>

              {/* Database Sync Status Banner */}
              <div className="no-print p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                    ✓
                  </div>
                  <div className="text-left">
                    <span className="font-quest font-bold text-sm text-emerald-900 dark:text-emerald-200 block">
                      {cloudSyncStatus === 'supabase_ok'
                        ? '✅ Tersimpan ke Database Cloud (Supabase) ✓'
                        : cloudSyncStatus === 'sheets_ok'
                        ? '✅ Tersimpan ke Database Cloud & Google Sheets ✓'
                        : cloudSyncStatus === 'saving'
                        ? '⏳ Sedang Menyimpan ke Database Cloud...'
                        : 'Jawaban Tersimpan Otomatis ✓'}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 block">
                      Jawaban Bagian A (1–8) &amp; Bagian B (9–10) atas nama {playerName} ({playerClass}) telah terekam di Rekap Admin.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('powerup');
                    finishQuiz();
                  }}
                  className="btn-3d btn-3d-neutral px-3.5 py-2 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>🔄 Kirim Ulang / Sinkronkan</span>
                </button>
              </div>

              {/* Mandatory Closing Message from Prompt */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50 via-emerald-50 to-amber-50 dark:from-indigo-950/60 dark:via-emerald-950/40 dark:to-slate-800/80 border-2 border-indigo-200 dark:border-indigo-800/80 text-center space-y-3">
                <span className="text-3xl block">🇮🇩</span>
                <h3 className="font-quest font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  Terima kasih telah berpartisipasi!
                </h3>
                <p className="font-sans font-medium text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
                  “Ingat, demokrasi bukan hanya tentang menggunakan hak pilih, tetapi juga tentang memahami, mengawasi, dan turut mengambil bagian dalam menentukan arah kebijakan negara.”
                </p>
              </div>

              {/* 4 Performance Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block">Skor Bagian A (PG)</span>
                  <span className="font-quest font-bold text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400 mt-1 block">{correctMcCount} / 8</span>
                  <span className="font-sans text-xs text-slate-500">Pemahaman Konsep &amp; Hukum</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block">Rekor Streak Terbaik</span>
                  <span className="font-quest font-bold text-2xl sm:text-3xl text-amber-500 mt-1 block">{maxStreak}x 🔥</span>
                  <span className="font-sans text-xs text-slate-500">Konsistensi Jawaban</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block">Bagian B (Studi Kasus)</span>
                  <span className="font-quest font-bold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 mt-1 block">2 / 2</span>
                  <span className="font-sans text-xs text-slate-500">Analisis &amp; Proyeksi Aksi</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block">Indeks Efikasi Warga</span>
                  <span className="font-quest font-bold text-2xl sm:text-3xl text-rose-500 mt-1 block">{civicGrade}</span>
                  <span className="font-sans text-xs text-slate-500">Siap Mengawal Kebijakan</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={copyResultReport}
                    className="btn-3d btn-3d-emerald px-5 py-3 rounded-2xl font-quest font-bold text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                    </svg>
                    <span>{copiedReport ? '✅ Lembar Jawaban Berhasil Disalin!' : 'Salin Lembar Jawaban Lengkap (Ke Dosen / LMS)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-3d btn-3d-neutral px-5 py-3 rounded-2xl font-quest font-bold text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setScreen('start');
                  }}
                  className="btn-3d btn-3d-indigo px-6 py-3 rounded-2xl font-quest font-bold text-sm flex items-center gap-2"
                >
                  <span>🔄 Main Lagi</span>
                </button>
              </div>
            </div>

            {/* Complete Interactive Answer Review */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                    PORTFOLIO &amp; EVALUASI PEMBELAJARAN
                  </span>
                  <h3 className="font-quest font-bold text-2xl text-slate-900 dark:text-white mt-0.5">
                    Tinjauan Lengkap Jawabanmu (Soal 1 – 10)
                  </h3>
                </div>

                <div className="no-print inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => { playSound('click'); setReviewTab('all'); }}
                    className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Semua (1–10)
                  </button>
                  <button
                    type="button"
                    onClick={() => { playSound('click'); setReviewTab('bagianA'); }}
                    className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === 'bagianA' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Bagian A (1–8)
                  </button>
                  <button
                    type="button"
                    onClick={() => { playSound('click'); setReviewTab('bagianB'); }}
                    className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === 'bagianB' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    Bagian B (9–10)
                  </button>
                </div>
              </div>

              {/* Review Bagian B */}
              {(reviewTab === 'all' || reviewTab === 'bagianB') && (
                <div className="space-y-4">
                  {BAGIAN_B_ESSAYS.map(item => {
                    const ans = essayAnswers[item.id] || { part1: '-', part2: '-', earnedXp: 0 };
                    return (
                      <div key={item.id} className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-quest font-bold text-base text-emerald-800 dark:text-emerald-300">
                            {item.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">
                            +{ans.earnedXp} XP
                          </span>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              {item.subLabel1}
                            </span>
                            <p className="text-slate-800 dark:text-slate-100 whitespace-pre-line">
                              {ans.part1 || '-'}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                              {item.subLabel2}
                            </span>
                            <p className="text-slate-800 dark:text-slate-100 whitespace-pre-line">
                              {ans.part2 || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Review Bagian A */}
              {(reviewTab === 'all' || reviewTab === 'bagianA') && (
                <div className="space-y-4">
                  {BAGIAN_A_QUESTIONS.map((q, idx) => {
                    const rec = mcAnswers[idx] || { selectedLetter: '-', isCorrect: false, earnedXp: 0 };
                    const chosenOpt = q.options.find(o => o.letter === rec.selectedLetter);
                    const correctOpt = q.options.find(o => o.letter === q.correctLetter);
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border-2 space-y-2 ${
                          rec.isCorrect
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-quest font-bold text-sm text-slate-900 dark:text-white">
                            Soal {q.id} • {q.category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold ${
                            rec.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {rec.isCorrect ? `Benar (+${rec.earnedXp} XP)` : 'Kurang Tepat'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{q.question}</p>
                        <div className="text-xs space-y-1 pt-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            Jawabanmu: <span className="font-mono font-bold">{rec.selectedLetter}.</span> {chosenOpt ? chosenOpt.text : '-'}
                          </p>
                          {!rec.isCorrect && (
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Kunci Jawaban: <span className="font-mono font-bold">{q.correctLetter}.</span> {correctOpt ? correctOpt.text : '-'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-quest font-bold text-slate-700 dark:text-slate-300">
            CIVIC QUEST • Media Pembelajaran Interaktif Kewarganegaraan
          </span>
          <span className="font-mono text-[11px]">
            Bagian A (8 Pilihan Ganda) &amp; Bagian B (2 Isian Studi Kasus)
          </span>
        </div>
      </footer>

      {/* ===================================================================
           MODAL: PIN AUTHENTICATION ADMIN (PIN: kel8juara)
           =================================================================== */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowPinModal(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-2xl space-y-5 animate-pop-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
                  🔐
                </div>
                <div>
                  <span className="font-mono text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block">
                    AKSES KHUSUS TIM ADMIN
                  </span>
                  <h3 className="font-quest font-bold text-xl text-slate-900 dark:text-white">
                    Masukkan Kode PIN Admin
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="btn-3d btn-3d-neutral p-2 rounded-xl text-slate-500"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Halaman ini memuat data real-time seluruh mahasiswa yang telah mengerjakan kuis beserta jawaban lengkapnya. Masukkan PIN Admin untuk melanjutkan.
            </p>

            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                PIN Admin
              </label>
              <div className="relative">
                <input
                  type={showPinText ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                  placeholder="Masukkan PIN Admin..."
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-mono text-sm font-bold text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPinText(!showPinText)}
                  className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {showPinText ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
              {pinError && (
                <p className="font-sans text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
                  ⚠️ Kode PIN tidak sesuai! Silakan periksa kembali PIN Admin Anda.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="btn-3d btn-3d-neutral px-5 py-2.5 rounded-xl font-quest font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                className="btn-3d btn-3d-indigo px-6 py-2.5 rounded-xl font-quest font-bold text-sm"
              >
                Buka Dashboard Admin →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
           MODAL: RINGKASAN MATERI ARTIKEL
           =================================================================== */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowArticleModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 animate-pop-in">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                  📖 INTISARI ARTIKEL ACUAN KUIS
                </span>
                <h3 className="font-quest font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
                  Apatisme Publik: Ketika Masyarakat Merasa Suaranya Tak Lagi Berarti
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowArticleModal(false)}
                className="btn-3d btn-3d-neutral p-2 rounded-xl text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">1. Apatisme vs. Kritik Demokratis</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Apatisme politik</strong> adalah sikap kurang tertarik atau tidak peduli terhadap persoalan dan proses politik. Sebaliknya, <strong>mengkritik pemerintah bukanlah apatisme</strong>—menyampaikan kritik, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas merupakan bagian dari kehidupan demokrasi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">2. Riset Putri, Marlina, &amp; Zain (2025)</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Survei terhadap <strong>567 pemuda Indonesia (16–30 tahun)</strong> dalam jurnal <em>Administratio</em> menemukan: <strong>96,3%</strong> mengenal konsep partisipasi kebijakan publik, namun hanya <strong>43,7%</strong> yang memahami prosesnya, dan <strong>19,2%</strong> yang terlibat langsung. Ada kesenjangan antara mengetahui, memahami, dan melakukan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">3. Political Efficacy &amp; Siklus Kebijakan</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Political efficacy (efikasi politik)</strong> adalah keyakinan bahwa seseorang mampu memahami dan berpartisipasi dalam politik serta suaranya berpotensi membawa pengaruh. Tahapan kebijakan publik meliputi: (1) <strong>Identifikasi masalah</strong>, (2) <strong>Perumusan alternatif penyelesaian</strong>, (3) <strong>Pengambilan keputusan</strong>, (4) <strong>Pelaksanaan dan evaluasi</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">4. Landasan Hukum &amp; Meaningful Participation</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>Pasal 96 UU No. 13 Tahun 2022</strong> menjamin hak masyarakat menyampaikan masukan lisan/tertulis dalam setiap tahapan pembentukan peraturan (daring/luring). <strong>Putusan MK No. 91/PUU-XVIII/2020</strong> menegaskan 3 hak <em>meaningful participation</em>: <strong>Right to be heard</strong> (hak didengar), <strong>Right to be considered</strong> (hak dipertimbangkan), dan <strong>Right to be explained</strong> (hak memperoleh penjelasan).
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowArticleModal(false)}
                className="btn-3d btn-3d-indigo px-6 py-2.5 rounded-xl font-quest font-bold text-sm"
              >
                Tutup &amp; Lanjutkan Kuis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
           MODAL: RESET CONFIRMATION
           =================================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowResetModal(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-6 shadow-2xl space-y-4 text-center animate-pop-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h3 className="font-quest font-bold text-xl text-slate-900 dark:text-white">
              Kembali ke Layar Utama?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Progres kuis kamu saat ini akan diatur ulang dari awal. Apakah kamu yakin ingin kembali ke menu utama?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="btn-3d btn-3d-neutral px-5 py-2.5 rounded-xl font-quest font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setScreen('start');
                  setXp(0);
                  setStreak(0);
                }}
                className="btn-3d btn-3d-rose px-5 py-2.5 rounded-xl font-quest font-bold text-sm"
              >
                Ya, Atur Ulang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
