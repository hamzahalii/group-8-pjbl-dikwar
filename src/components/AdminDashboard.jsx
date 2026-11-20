import React, { useState, useEffect } from 'react';
import { 
  BAGIAN_A_QUESTIONS, 
  MODERATOR_PIN_CODE, 
  STORAGE_KEY_SUBMISSIONS, 
  STORAGE_KEY_SHEETS_URL 
} from '../data/kuisData';
import { 
  fetchAllSubmissions, 
  upsertSubmission, 
  updateAdminGrade,
  deleteSubmission
} from '../lib/supabaseDb';
import { 
  Key, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  PlusCircle, 
  Search, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Code, 
  ChevronDown, 
  Save, 
  X, 
  Award, 
  FileSpreadsheet,
  AlertCircle,
  Database,
  Trash2
} from 'lucide-react';

export default function AdminDashboard({ setView, onClose }) {
  // Authentication: Password preserved as MODERATOR_PIN_CODE ("kel8juara")
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('dikwar_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Submissions & Sheets URL
  const [submissions, setSubmissions] = useState([]);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('');

  // Guide Panel for Google Apps Script (Code.gs)
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Inspector Modal
  const [inspectedStudent, setInspectedStudent] = useState(null);
  const [modGrade9, setModGrade9] = useState(0);
  const [modComment9, setModComment9] = useState('');
  const [modGrade10, setModGrade10] = useState(0);
  const [modComment10, setModComment10] = useState('');
  const [savedFeedbackAlert, setSavedFeedbackAlert] = useState(false);
  const [copiedStudentText, setCopiedStudentText] = useState(false);

  // Delete Confirmation Modal
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close handler: either onClose prop or setView('kuis')
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setView) {
      setView('kuis');
    }
  };

  // Load submissions & URL on mount (Supabase first + localStorage fallback)
  useEffect(() => {
    let localList = [];
    try {
      const storedSubs = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (storedSubs) {
        localList = JSON.parse(storedSubs);
        setSubmissions(localList);
      }
      const storedUrl = localStorage.getItem(STORAGE_KEY_SHEETS_URL);
      if (storedUrl) setSheetsUrl(storedUrl);
    } catch (e) {
      console.error(e);
    }

    // Ambil data terbaru dari Supabase
    fetchAllSubmissions()
      .then(remoteList => {
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          const mapById = {};
          localList.forEach(s => {
            const key = s.id || s.docId;
            if (key) mapById[key] = s;
          });
          remoteList.forEach(s => {
            const key = s.id || s.docId;
            if (key) mapById[key] = s;
          });
          const merged = Object.values(mapById).sort(
            (a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0)
          );
          setSubmissions(merged);
          localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(merged));
          setSyncMessage(`Otomatis terhubung ke Supabase (${remoteList.length} data termutakhir).`);
          setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        }
      })
      .catch(err => {
        console.error('[AdminDashboard] fetch error:', err);
      });
  }, []);

  // Tarik data langsung dari Supabase
  const handleFetchFromSupabase = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Menghubungi Supabase untuk menarik seluruh jawaban mahasiswa...');
    try {
      const remote = await fetchAllSubmissions();
      if (Array.isArray(remote)) {
        const mapById = {};
        submissions.forEach(s => {
          const key = s.id || s.docId;
          if (key) mapById[key] = s;
        });
        remote.forEach(s => {
          const key = s.id || s.docId;
          if (key) mapById[key] = s;
        });
        const merged = Object.values(mapById).sort(
          (a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0)
        );
        setSubmissions(merged);
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(merged));
        setSyncStatus('success');
        setSyncMessage(`Berhasil menarik & menyinkronkan ${remote.length} data dari database Supabase.`);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        throw new Error('Gagal mengambil data dari Supabase');
      }
    } catch (e) {
      setSyncStatus('error');
      setSyncMessage('Gagal menarik data dari Supabase. Menggunakan cache data lokal.');
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === MODERATOR_PIN_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dikwar_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveSheetsUrl = () => {
    if (sheetsUrl && !sheetsUrl.startsWith('https://script.google.com/')) {
      alert('⚠️ Format URL harus diawali https://script.google.com/macros/s/.../exec');
      return;
    }
    localStorage.setItem(STORAGE_KEY_SHEETS_URL, sheetsUrl);
    alert('✅ URL Google Sheets Web App tersimpan!');
    if (sheetsUrl) handleFetchFromSheets();
  };

  // Google Sheets 2-Way Sync
  const handleFetchFromSheets = async () => {
    if (!sheetsUrl) {
      alert('Tempelkan URL Google Apps Script Web App terlebih dahulu.');
      return;
    }
    setSyncStatus('syncing');
    setSyncMessage('Menghubungi Google Sheets untuk menarik seluruh jawaban mahasiswa...');

    try {
      const sep = sheetsUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${sheetsUrl}${sep}action=getAll&t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const data = await res.json();

      if (data && Array.isArray(data.submissions)) {
        const mapById = {};
        submissions.forEach(s => {
          const key = s.id || s.docId;
          if (key) mapById[key] = s;
        });

        data.submissions.forEach(s => {
          if (!s) return;
          const key = s.id || s.docId || `GS-${Math.random().toString(36).substring(2, 8)}`;
          s.id = key;
          s.docId = key;
          mapById[key] = s;
        });

        const merged = Object.values(mapById);
        setSubmissions(merged);
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(merged));

        setSyncStatus('success');
        setSyncMessage(`Berhasil menarik & menyinkronkan ${data.submissions.length} data mahasiswa dari Google Sheets.`);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        throw new Error('Format respon tidak sesuai');
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Gagal menarik data dari Google Sheets. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa saja).');
    }
  };

  // Seed Demo Data
  const handleSeedDemo = () => {
    const samples = [
      { name: "Nadira Putri Pratama", prodi: "Ilmu Komputer", univ: "Institut Pertanian Bogor", score: 8 },
      { name: "Raka Aditya Wijaya", prodi: "Matematika", univ: "Institut Pertanian Bogor", score: 7 },
      { name: "Kirana Larasati", prodi: "Agribisnis", univ: "Universitas Padjadjaran", score: 6 },
      { name: "Fadhil Ramadhan", prodi: "Ilmu Komputer", univ: "Institut Pertanian Bogor", score: 8 }
    ];
    const pick = samples[submissions.length % samples.length];
    const now = new Date();
    const demoId = `CQ-DEMO-${now.getTime()}`;

    const demoMcq = BAGIAN_A_QUESTIONS.map((q, idx) => {
      const isCorrect = idx < pick.score;
      const letter = isCorrect ? q.correctLetter : (q.correctLetter === 'A' ? 'B' : 'A');
      const opt = q.options.find(o => o.letter === letter);
      return {
        questionId: q.id,
        selectedOption: letter,
        selectedText: opt ? opt.text : '-',
        correctOption: q.correctLetter,
        isCorrect,
        earnedXp: isCorrect ? 115 : 0
      };
    });

    const demoSub = {
      id: demoId,
      docId: demoId,
      studentName: pick.name,
      studentProdi: pick.prodi,
      studentUniversity: pick.univ,
      mcqScore: pick.score,
      mcqPercentage: Math.round((pick.score / 8) * 100),
      xp: pick.score * 115 + 360,
      baseXp: pick.score * 115 + 360,
      maxStreak: pick.score,
      mcqAnswers: demoMcq,
      essay9: {
        part1_mengapa_apatis: "Ketidaktahuan proses penyusunan kebijakan dan perasaan bahwa suara mahasiswa tidak didengarkan melemahkan political efficacy sehingga mendorong sikap apatis.",
        part2_dua_tindakan: "1) Membaca dokumen resmi dan membuat kajian dampak tarif transportasi. 2) Menyampaikan aspirasi tertulis/lisan melalui konsultasi publik sesuai Pasal 96 UU 13/2022.",
        earnedXp: 180,
        moderatorScore: 0,
        moderatorComment: ""
      },
      essay10: {
        part1_bentuk_apatisme: "Menganggap kewajiban warga negara selesai setelah pemilu sehingga abai mengawasi kebijakan publik sehari-hari.",
        part2_aksi_dan_alasan: "Membuat Klinik Literasi Kebijakan Kampus untuk menjembatani kesenjangan pemuda yang kenal konsep (96,3%) namun belum paham proses partisipasi (43,7%).",
        earnedXp: 180,
        moderatorScore: 0,
        moderatorComment: ""
      },
      moderatorReviewed: false,
      submittedAt: now.toISOString(),
      submittedAtMs: now.getTime(),
      submittedAtWIB: now.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      })
    };

    const updated = [demoSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));

    // Kirim data demo ke database Supabase
    upsertSubmission(demoSub)
      .then(ok => {
        if (ok) {
          setSyncMessage(`Data demo ${pick.name} berhasil tersimpan ke Supabase & lokal.`);
        }
      })
      .catch(e => console.error(e));

    if (sheetsUrl) {
      postSingleSubmission(demoSub, 'submitQuiz');
    }
  };

  // POST Submission to Sheets
  const postSingleSubmission = async (sub, actionType) => {
    if (!sheetsUrl) return;
    const e9 = sub.essay9 || {};
    const e10 = sub.essay10 || {};
    const mod9 = Number(e9.moderatorScore || 0);
    const mod10 = Number(e10.moderatorScore || 0);
    const baseXp = Number(sub.baseXp !== undefined ? sub.baseXp : (sub.xp || 0));
    const totalXp = baseXp + mod9 + mod10;

    const mcMap = {};
    BAGIAN_A_QUESTIONS.forEach((q, i) => {
      const rec = (Array.isArray(sub.mcqAnswers) && sub.mcqAnswers[i])
        ? sub.mcqAnswers[i]
        : { selectedOption: '-', isCorrect: false };
      mcMap[`Q${q.id}`] = `${rec.selectedOption} (${rec.isCorrect ? 'Benar' : 'Salah'})`;
    });

    const payload = {
      action: actionType || 'submitQuiz',
      id: sub.id || sub.docId,
      timestamp: sub.submittedAtWIB || sub.submittedAt,
      name: sub.studentName || sub.name,
      prodi: sub.studentProdi || '-',
      universitas: sub.studentUniversity || '-',
      mcScore: `${sub.mcqScore || 0}/8 (${sub.mcqPercentage || 0}%)`,
      xp: totalXp,
      mcAnswers: mcMap,
      essay9: `[Mengapa Apatis]: ${e9.part1_mengapa_apatis || '-'} | [2 Tindakan]: ${e9.part2_dua_tindakan || '-'}`,
      essay10: `[Bentuk Apatisme]: ${e10.part1_bentuk_apatisme || '-'} | [Aksi & Harapan]: ${e10.part2_aksi_dan_alasan || '-'}`,
      modScore9: mod9,
      modComment9: e9.moderatorComment || '',
      modScore10: mod10,
      modComment10: e10.moderatorComment || '',
      gradedByMod: Boolean(sub.moderatorReviewed || mod9 > 0 || mod10 > 0 || e9.moderatorComment || e10.moderatorComment),
      rawSubmission: sub
    };

    try {
      await fetch(sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (submissions.length === 0) {
      alert('Belum ada data rekapan jawaban mahasiswa.');
      return;
    }

    const headers = [
      "No", "Waktu Submit", "Nama Lengkap", "Program Studi", "Universitas",
      "Skor PG (Benar/8)", "Akurasi PG (%)", "Total XP (Termasuk Bonus)",
      "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
      "Esai 9.1 (Mengapa Apatis)", "Esai 9.2 (2 Tindakan Konkret)",
      "Bonus XP Esai 9", "Komentar Admin Esai 9",
      "Esai 10.1 (Bentuk Apatisme)", "Esai 10.2 (Aksi & Harapan)",
      "Bonus XP Esai 10", "Komentar Admin Esai 10"
    ];

    const csvCell = (val) => {
      const str = String(val === null || val === undefined ? "" : val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = [headers.map(csvCell).join(",")];
    submissions.forEach((s, idx) => {
      const e9 = s.essay9 || {};
      const e10 = s.essay10 || {};
      const totalXp = (s.baseXp || s.xp || 0) + Number(e9.moderatorScore || 0) + Number(e10.moderatorScore || 0);

      const mcCols = BAGIAN_A_QUESTIONS.map((q, i) => {
        const rec = (Array.isArray(s.mcqAnswers) && s.mcqAnswers[i]) ? s.mcqAnswers[i] : { selectedOption: "-", isCorrect: false };
        return `${rec.selectedOption} (${rec.isCorrect ? "Benar" : "Salah"})`;
      });

      const row = [
        idx + 1,
        s.submittedAtWIB || s.date || "-",
        s.studentName || s.name || "-",
        s.studentProdi || '-',
        s.studentUniversity || '-',
        `${s.mcqScore || s.mcCorrectCount || 0}/8`,
        `${s.mcqPercentage || Math.round(((s.mcqScore || 0) / 8) * 100)}%`,
        totalXp,
        mcCols[0], mcCols[1], mcCols[2], mcCols[3],
        mcCols[4], mcCols[5], mcCols[6], mcCols[7],
        e9.part1_mengapa_apatis || "-",
        e9.part2_dua_tindakan || "-",
        e9.moderatorScore || 0,
        e9.moderatorComment || "",
        e10.part1_bentuk_apatisme || "-",
        e10.part2_aksi_dan_alasan || "-",
        e10.moderatorScore || 0,
        e10.moderatorComment || ""
      ];
      rows.push(row.map(csvCell).join(","));
    });

    const csvContent = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_CivicQuest_Admin_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete Student Submission Handler
  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    const docId = studentToDelete.id || studentToDelete.docId;
    const studentName = studentToDelete.studentName || studentToDelete.name || 'Mahasiswa';

    // 1. Hapus dari state lokal & localStorage
    const updated = submissions.filter(s => (s.id || s.docId) !== docId);
    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));

    // 2. Hapus dari database Supabase
    if (docId) {
      await deleteSubmission(docId).catch(e => console.error(e));
    }

    // 3. Jika sedang membuka modal detail mahasiswa ini, tutup modalnya
    if (inspectedStudent && (inspectedStudent.id || inspectedStudent.docId) === docId) {
      setInspectedStudent(null);
    }

    setIsDeleting(false);
    setStudentToDelete(null);
    setSyncMessage(`Data hasil kuis milik "${studentName}" berhasil dihapus dari sistem & Supabase.`);
  };

  // Inspect Student Modal
  const openInspector = (student) => {
    setInspectedStudent(student);
    const e9 = student.essay9 || {};
    const e10 = student.essay10 || {};
    setModGrade9(e9.moderatorScore || 0);
    setModComment9(e9.moderatorComment || "");
    setModGrade10(e10.moderatorScore || 0);
    setModComment10(e10.moderatorComment || "");
    setSavedFeedbackAlert(false);
  };

  const saveFeedback = () => {
    if (!inspectedStudent) return;
    const docId = inspectedStudent.docId || inspectedStudent.id;

    const updated = submissions.map(s => {
      if ((s.docId || s.id) === docId) {
        return {
          ...s,
          moderatorReviewed: true,
          essay9: {
            ...(s.essay9 || {}),
            moderatorScore: Number(modGrade9 || 0),
            moderatorComment: modComment9
          },
          essay10: {
            ...(s.essay10 || {}),
            moderatorScore: Number(modGrade10 || 0),
            moderatorComment: modComment10
          }
        };
      }
      return s;
    });

    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
    setSavedFeedbackAlert(true);

    const targetSub = updated.find(s => (s.docId || s.id) === docId);
    if (targetSub) {
      // Simpan pembaruan nilai & feedback esai ke Supabase
      updateAdminGrade(docId, targetSub.essay9, targetSub.essay10)
        .then(ok => {
          if (ok) {
            setSyncMessage(`Nilai & komentar untuk ${targetSub.studentName || targetSub.name} berhasil diperbarui di Supabase.`);
          }
        })
        .catch(e => console.error(e));

      if (sheetsUrl) {
        postSingleSubmission(targetSub, 'updateGrade');
      }
    }
  };

  const copyInspectedStudentReport = () => {
    if (!inspectedStudent) return;
    const e9 = inspectedStudent.essay9 || {};
    const e10 = inspectedStudent.essay10 || {};
    const totalXp = (inspectedStudent.baseXp || inspectedStudent.xp || 0) + Number(modGrade9 || 0) + Number(modGrade10 || 0);

    const text = [
      `HASIL KUIS CIVIC QUEST — ${inspectedStudent.studentName || inspectedStudent.name} (${inspectedStudent.studentProdi || '-'} — ${inspectedStudent.studentUniversity || '-'})`,
      `Waktu Submit: ${inspectedStudent.submittedAtWIB || inspectedStudent.date || "-"}`,
      `Skor PG: ${inspectedStudent.mcqScore || inspectedStudent.mcCorrectCount || 0}/8`,
      `Total XP: ${totalXp} XP`,
      "",
      `Esai Soal 9.1: ${e9.part1_mengapa_apatis || "-"}`,
      `Esai Soal 9.2: ${e9.part2_dua_tindakan || "-"}`,
      `Nilai & Catatan Admin Soal 9: +${modGrade9} Poin | Catatan: ${modComment9 || "-"}`,
      "",
      `Esai Soal 10.1: ${e10.part1_bentuk_apatisme || "-"}`,
      `Esai Soal 10.2: ${e10.part2_aksi_dan_alasan || "-"}`,
      `Nilai & Catatan Admin Soal 10: +${modGrade10} Poin | Catatan: ${modComment10 || "-"}`
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedStudentText(true);
    setTimeout(() => setCopiedStudentText(false), 2000);
  };

  // Metrics calculations
  const totalStudents = submissions.length;
  const avgMcqScore = totalStudents > 0 
    ? (submissions.reduce((acc, s) => acc + Number(s.mcqScore || s.mcCorrectCount || 0), 0) / totalStudents).toFixed(1)
    : '0.0';
  const avgMcqPercentage = totalStudents > 0
    ? Math.round((Number(avgMcqScore) / 8) * 100)
    : 0;
  const avgXp = totalStudents > 0
    ? Math.round(submissions.reduce((acc, s) => {
        const e9 = s.essay9 || {};
        const e10 = s.essay10 || {};
        return acc + (s.baseXp || s.xp || 0) + (e9.moderatorScore || 0) + (e10.moderatorScore || 0);
      }, 0) / totalStudents)
    : 0;
  const essayCompleteCount = submissions.filter(s => {
    const e9 = s.essay9;
    const e10 = s.essay10;
    return e9 && e10 && (e9.part1_mengapa_apatis || e9.part2_dua_tindakan);
  }).length;
  const essayCompleteRate = totalStudents > 0 ? Math.round((essayCompleteCount / totalStudents) * 100) : 0;

  // Filtered & Sorted submissions
  const filteredSubmissions = submissions.filter(s => {
    const name = (s.studentName || s.name || "").toLowerCase();
    const prodi = (s.studentProdi || "").toLowerCase();
    const univ = (s.studentUniversity || "").toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    return !query || name.includes(query) || prodi.includes(query) || univ.includes(query);
  }).sort((a, b) => {
    if (sortOrder === 'highest_mcq') return (b.mcqScore || b.mcCorrectCount || 0) - (a.mcqScore || a.mcCorrectCount || 0);
    if (sortOrder === 'highest_xp') return (b.xp || 0) - (a.xp || 0);
    if (sortOrder === 'name_asc') return (a.studentName || a.name || "").localeCompare(b.studentName || b.name || "");
    if (sortOrder === 'oldest') return (a.submittedAtMs || a.id || 0) - (b.submittedAtMs || b.id || 0);
    return (b.submittedAtMs || b.id || 0) - (a.submittedAtMs || a.id || 0);
  });

  // Code.gs sample string
  const appsScriptCode = `// GOOGLE APPS SCRIPT (Code.gs) — DATABASE 2 ARAH CIVIC QUEST
const SHEET_NAME = 'Jawaban_Mahasiswa';
const HEADERS = ['ID', 'Waktu Submit', 'Nama Lengkap', 'Program Studi', 'Universitas', 'Skor PG (Benar/8)', 'Total XP', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Esai 9 (Analisis Kasus)', 'Esai 10 (Refleksi & Aksi)', 'Bonus XP Esai 9', 'Komentar Admin Esai 9', 'Bonus XP Esai 10', 'Komentar Admin Esai 10', 'Status Dinilai', 'Raw JSON'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setBackground('#312E81').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const sheet = getOrCreateSheet();
    const body = JSON.parse(e.postData.contents);
    const id = String(body.id || ('CQ-' + new Date().getTime()));
    const mc = body.mcAnswers || {};
    const rowValues = [
      id, body.timestamp || new Date().toLocaleString('id-ID'), body.name || '-', body.prodi || '-', body.universitas || '-',
      body.mcScore || '0/8', Number(body.xp || 0),
      mc.Q1 || '-', mc.Q2 || '-', mc.Q3 || '-', mc.Q4 || '-', mc.Q5 || '-', mc.Q6 || '-', mc.Q7 || '-', mc.Q8 || '-',
      body.essay9 || '-', body.essay10 || '-',
      Number(body.modScore9 || 0), body.modComment9 || '', Number(body.modScore10 || 0), body.modComment10 || '',
      body.gradedByMod ? 'Sudah Dinilai Admin' : 'Menunggu Penilaian', JSON.stringify(body.rawSubmission || body)
    ];
    const lastRow = sheet.getLastRow();
    let foundRow = -1;
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === id) { foundRow = i + 2; break; }
      }
    }
    if (foundRow !== -1) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: id })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', submissions: [] })).setMimeType(ContentService.MimeType.JSON);
    }
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const submissions = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] && !r[2]) continue;
      let obj = null;
      try { obj = r[22] ? JSON.parse(r[22]) : null; } catch (err) { obj = null; }
      if (!obj) {
        obj = {
          id: String(r[0]), docId: String(r[0]),
          submittedAtWIB: String(r[1]),
          studentName: String(r[2]), studentProdi: String(r[3]), studentUniversity: String(r[4]),
          mcqScore: parseInt(String(r[5]).split('/')[0], 10) || 0,
          mcqPercentage: Math.round(((parseInt(String(r[5]).split('/')[0], 10) || 0) / 8) * 100),
          xp: Number(r[6] || 0),
          essay9: { part1_mengapa_apatis: String(r[15]), part2_dua_tindakan: '', moderatorScore: Number(r[17] || 0), moderatorComment: String(r[18] || '') },
          essay10: { part1_bentuk_apatisme: String(r[16]), part2_aksi_dan_alasan: '', moderatorScore: Number(r[19] || 0), moderatorComment: String(r[20] || '') }
        };
      } else {
        if (!obj.essay9) obj.essay9 = {};
        if (!obj.essay10) obj.essay10 = {};
        obj.essay9.moderatorScore = Number(r[17] || obj.essay9.moderatorScore || 0);
        obj.essay9.moderatorComment = String(r[18] || obj.essay9.moderatorComment || '');
        obj.essay10.moderatorScore = Number(r[19] || obj.essay10.moderatorScore || 0);
        obj.essay10.moderatorComment = String(r[20] || obj.essay10.moderatorComment || '');
        obj.moderatorReviewed = (String(r[21]) === 'Sudah Dinilai Admin') || Boolean(obj.moderatorReviewed);
      }
      submissions.push(obj);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', submissions: submissions })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString(), submissions: [] })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // ==============================================================
  // VIEW 1: PIN AUTHENTICATION GATE
  // ==============================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase text-amber-600 dark:text-amber-400 block">
                AKSES KHUSUS TIM ADMIN
              </span>
              <h1 className="font-quest font-bold text-2xl text-slate-900 dark:text-white">
                Dashboard Admin
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Halaman ini memuat data real-time seluruh mahasiswa yang telah mengerjakan kuis beserta jawaban lengkapnya. Masukkan PIN Admin untuk melanjutkan.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                PIN Admin
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Masukkan PIN Admin..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-mono text-sm font-bold text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-xs font-mono text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPin ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-rose-500 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> PIN tidak cocok. Silakan coba kembali.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-3d btn-3d-neutral flex-1 py-3 rounded-xl font-bold text-sm"
              >
                Kembali ke Kuis
              </button>
              <button
                type="submit"
                className="btn-3d btn-3d-amber flex-1 py-3 rounded-xl font-bold text-sm shadow-md"
              >
                Buka Dashboard
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // ==============================================================
  // VIEW 2: FULL ADMIN COMMAND CENTER DASHBOARD
  // ==============================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* TOP HEADER COMMAND BANNER */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-slate-900 text-white border-2 border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> ADMIN COMMAND CENTER
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Supabase Terhubung
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Database Aktif ({totalStudents} Mahasiswa)
            </span>
          </div>

          <h1 className="font-quest font-bold text-2xl sm:text-4xl tracking-tight text-white">
            Dashboard Admin: Rekapitulasi &amp; Penilaian Esai
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Pantau dan nilai hasil kuis kewarganegaraan <strong>Apatisme Publik &amp; Demokrasi</strong>, berikan nilai tambahan &amp; apresiasi esai Soal 9 &amp; 10, tersimpan otomatis di <strong>Supabase Cloud Database</strong> serta sinkron ke Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleFetchFromSupabase}
            className="btn-3d btn-3d-indigo px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
            title="Tarik data terbaru dari Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Tarik Supabase</span>
          </button>

          <button
            onClick={handleFetchFromSheets}
            className="btn-3d btn-3d-neutral px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
            title="Tarik data terbaru dari Google Sheets"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tarik Sheets</span>
          </button>

          <button
            onClick={handleSeedDemo}
            className="btn-3d btn-3d-neutral px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
            title="Tambahkan data simulasi pengerjaan mahasiswa"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>+ Data Simulasi</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="btn-3d btn-3d-emerald px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV / Excel</span>
          </button>

          <button
            onClick={handleClose}
            className="btn-3d btn-3d-rose px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>✕ Tutup Dashboard Admin</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* SUPABASE CLOUD DATABASE CONNECTION CARD */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-800/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-indigo-700 dark:text-indigo-400">
                    DATABASE CLOUD RESMI (SUPABASE POSTGRESQL)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold">
                    🟢 Supabase Terhubung
                  </span>
                </div>
                <h2 className="font-quest font-bold text-lg sm:text-xl text-slate-900 dark:text-white mt-0.5">
                  Pusat Database Cloud Supabase
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                  Endpoint: <span className="text-indigo-600 dark:text-indigo-400 font-bold">https://pryccuueegfjxcloqdqt.supabase.co</span> • Tabel: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">civic_quest_submissions</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start lg:self-auto">
              <button
                onClick={handleFetchFromSupabase}
                className="btn-3d btn-3d-indigo px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Data Supabase</span>
              </button>
            </div>
          </div>
        </div>

        {/* GOOGLE SHEETS 2-WAY CONNECTION CENTER */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800/80 p-6 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    INTEGRASI GOOGLE SHEETS REAL-TIME (2 ARAH)
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                    sheetsUrl ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {sheetsUrl ? '🟢 Google Sheets Aktif' : '⚪ URL Belum Diatur'}
                  </span>
                </div>
                <h2 className="font-quest font-bold text-lg sm:text-xl text-slate-900 dark:text-white mt-0.5">
                  Pusat Koneksi Database Google Sheets Admin
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Tempelkan URL Web App Google Apps Script (/exec) untuk merekam dan menyinkronkan seluruh jawaban mahasiswa.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCodeGuide(!showCodeGuide)}
              className="btn-3d btn-3d-neutral px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300 self-start lg:self-auto"
            >
              <Code className="w-4 h-4 text-indigo-600" />
              <span>{showCodeGuide ? 'Sembunyikan Panduan Code.gs' : 'Lihat & Salin Kode Google Apps Script (Code.gs)'}</span>
            </button>
          </div>

          {/* Input & Action */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-8">
              <label className="block font-mono text-[11px] font-bold uppercase text-slate-500 mb-1">
                URL Web App Google Apps Script (/exec):
              </label>
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:outline-none font-mono text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="lg:col-span-4 flex items-end gap-2 pt-1 lg:pt-5">
              <button
                onClick={handleSaveSheetsUrl}
                className="btn-3d btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan URL</span>
              </button>
              <button
                onClick={handleFetchFromSheets}
                className="btn-3d btn-3d-indigo py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sinkronkan</span>
              </button>
            </div>
          </div>

          {/* Sync status log */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {syncMessage || '💡 Klik tombol "Lihat & Salin Kode Google Apps Script (Code.gs)" untuk memasang script penerima di Google Sheets Anda.'}
            </span>
            {lastSyncTime && (
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Sinkron: {lastSyncTime}
              </span>
            )}
          </div>

          {/* Code.gs Modal / Panel */}
          {showCodeGuide && (
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border-2 border-indigo-500/40 space-y-4 animate-pop-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase text-amber-400 block">
                    PANDUAN INSTALASI 2 MENIT • GOOGLE SHEETS BACKEND
                  </span>
                  <h3 className="font-quest font-bold text-base sm:text-lg text-white">
                    Cara Menghubungkan Dashboard Admin ke Google Sheets Anda
                  </h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="btn-3d btn-3d-emerald px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? '✅ Kode Disalin!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>

              <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <li>Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-bold">Google Sheets Baru (sheets.new)</a>, beri nama <strong>"Database Kuis Civic Quest"</strong>.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
                <li>Hapus seluruh kode bawaan, lalu klik <strong>"Salin Kode Code.gs"</strong> dan tempelkan (Paste) ke editor Apps Script, simpan (Ctrl+S).</li>
                <li>Klik <strong>Terapkan (Deploy)</strong> &rarr; <strong>Deployment baru (New deployment)</strong> &rarr; pilih jenis <strong>Aplikasi web (Web app)</strong>.</li>
                <li>Pilih <strong>Jalankan sebagai: Saya (Me)</strong> dan <strong>Siapa yang memiliki akses: Siapa saja (Anyone)</strong>.</li>
                <li>Klik <strong>Terapkan (Deploy)</strong>, salin <strong>URL Aplikasi Web (/exec)</strong>, lalu tempelkan pada kolom URL di atas.</li>
              </ol>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed select-all">
                {appsScriptCode}
              </pre>
            </div>
          )}

        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="font-mono text-xs text-slate-500 uppercase font-bold block">Total Mahasiswa Mengisi</span>
            <span className="font-quest font-bold text-3xl sm:text-4xl text-indigo-600 dark:text-indigo-400 mt-1 block">{totalStudents}</span>
            <span className="font-sans text-xs text-slate-500">Data Masuk Real-Time</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="font-mono text-xs text-slate-500 uppercase font-bold block">Rata-Rata Skor Bagian A</span>
            <span className="font-quest font-bold text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 mt-1 block">{avgMcqScore} / 8</span>
            <span className="font-sans text-xs text-slate-500">Akurasi Kelas: {avgMcqPercentage}%</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="font-mono text-xs text-slate-500 uppercase font-bold block">Rata-Rata Total XP</span>
            <span className="font-quest font-bold text-3xl sm:text-4xl text-amber-500 mt-1 block">{avgXp} XP</span>
            <span className="font-sans text-xs text-slate-500">Termasuk Bonus Esai Admin</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="font-mono text-xs text-slate-500 uppercase font-bold block">Partisipasi Esai (9–10)</span>
            <span className="font-quest font-bold text-3xl sm:text-4xl text-rose-500 mt-1 block">{essayCompleteRate}%</span>
            <span className="font-sans text-xs text-slate-500">Kelengkapan Studi Kasus</span>
          </div>
        </div>

        {/* ANALITIK AKURASI PER SOAL (SOAL 1 - 8) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                📊 ANALITIK PEMAHAMAN KONSEP
              </span>
              <h3 className="font-quest font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Persentase Menjawab Benar Per Soal (Bagian A: Soal 1 – 8)
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">Diperbarui otomatis saat data masuk</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BAGIAN_A_QUESTIONS.map((q, idx) => {
              let correctCount = 0;
              submissions.forEach(s => {
                if (Array.isArray(s.mcqAnswers) && s.mcqAnswers[idx] && s.mcqAnswers[idx].isCorrect) {
                  correctCount += 1;
                }
              });
              const pct = totalStudents > 0 ? Math.round((correctCount / totalStudents) * 100) : 0;
              return (
                <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-quest font-bold text-slate-800 dark:text-slate-100">Soal {q.id}</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="font-sans text-[11px] text-slate-500 block truncate">{q.category}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEARCH, SORT & STUDENT SUBMISSIONS TABLE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, program studi, atau universitas..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-sans text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-mono text-xs font-bold text-slate-500">Urutkan:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-sans text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="newest">Waktu Terbaru</option>
                <option value="oldest">Waktu Terlama</option>
                <option value="highest_mcq">Skor PG Tertinggi</option>
                <option value="highest_xp">Total XP Tertinggi</option>
                <option value="name_asc">Nama Mahasiswa (A–Z)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Waktu Submit</th>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Program Studi</th>
                  <th className="py-3.5 px-4">Universitas</th>
                  <th className="py-3.5 px-4">Skor PG (1–8)</th>
                  <th className="py-3.5 px-4">Total XP</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans text-xs sm:text-sm">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 px-4 text-center text-slate-500">
                      Belum ada data pengerjaan mahasiswa yang cocok. Klik tombol <strong>"+ Data Simulasi"</strong> untuk menambahkan data demo.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((s, idx) => {
                    const e9 = s.essay9 || {};
                    const e10 = s.essay10 || {};
                    const totalXp = (s.baseXp || s.xp || 0) + Number(e9.moderatorScore || 0) + Number(e10.moderatorScore || 0);
                    return (
                      <tr key={s.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">{s.submittedAtWIB || s.date || "-"}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {s.studentName || s.name || "-"}
                          {s.moderatorReviewed && (
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
                              ★ Dinilai
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">{s.studentProdi || "-"}</td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{s.studentUniversity || "-"}</td>
                        <td className="py-3.5 px-4 font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          {s.mcqScore || s.mcCorrectCount || 0}/8 ({s.mcqPercentage || Math.round(((s.mcqScore || 0) / 8) * 100)}%)
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">{totalXp} XP</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openInspector(s)}
                              className="btn-3d btn-3d-indigo px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                              title="Periksa lembar jawaban dan beri penilaian esai"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat &amp; Nilai</span>
                            </button>
                            <button
                              onClick={() => setStudentToDelete(s)}
                              className="btn-3d btn-3d-rose px-2.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                              title="Hapus data peserta ini dari tabel &amp; Supabase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ==============================================================
           MODAL: STUDENT ANSWER INSPECTOR & ESSAY GRADING
           ============================================================== */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setInspectedStudent(null)} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 animate-pop-in">
            
            {/* Modal Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                  🎓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                      {inspectedStudent.studentProdi || '-'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold">
                      {inspectedStudent.studentUniversity || '-'}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {inspectedStudent.submittedAtWIB || inspectedStudent.date || "-"}
                    </span>
                  </div>
                  <h3 className="font-quest font-bold text-2xl text-slate-900 dark:text-white mt-0.5">
                    {inspectedStudent.studentName || inspectedStudent.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyInspectedStudentReport}
                  className="btn-3d btn-3d-emerald px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedStudentText ? '✅ Disalin!' : 'Salin Lembar Jawaban'}</span>
                </button>
                <button
                  onClick={() => setInspectedStudent(null)}
                  className="btn-3d btn-3d-neutral p-2 rounded-xl text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[11px] text-slate-500 block">Skor Pilihan Ganda</span>
                <span className="font-quest font-bold text-xl text-indigo-600 dark:text-indigo-400">
                  {inspectedStudent.mcqScore || inspectedStudent.mcCorrectCount || 0}/8
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[11px] text-slate-500 block">Total XP</span>
                <span className="font-quest font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  {(inspectedStudent.baseXp || inspectedStudent.xp || 0) + Number(modGrade9 || 0) + Number(modGrade10 || 0)} XP
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-[11px] text-slate-500 block">Status Esai</span>
                <span className="font-quest font-bold text-xl text-amber-500">
                  {inspectedStudent.essay9 ? 'Lengkap ✓' : 'Belum Lengkap'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-300 block">Nilai Tambahan Admin</span>
                <span className="font-quest font-bold text-xl text-indigo-700 dark:text-indigo-300">
                  +{Number(modGrade9 || 0) + Number(modGrade10 || 0)} Poin
                </span>
              </div>
            </div>

            {/* Bagian B: Jawaban Esai Soal 9 & Soal 10 */}
            <div className="space-y-4">
              <h4 className="font-quest font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                ✍️ Bagian B — Jawaban Isian &amp; Studi Kasus (Soal 9 &amp; 10)
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-quest font-bold text-sm text-indigo-700 dark:text-indigo-300 block">
                  Soal 9 — Analisis Kasus Biaya Transportasi Umum
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>1. Mengapa mendorong apatisme:</strong> {inspectedStudent.essay9?.part1_mengapa_apatis || '-'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>2. Dua tindakan konkret:</strong> {inspectedStudent.essay9?.part2_dua_tindakan || '-'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-quest font-bold text-sm text-emerald-700 dark:text-emerald-300 block">
                  Soal 10 — Refleksi &amp; Proyeksi Aksi Kampus
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>1. Bentuk apatisme mahasiswa:</strong> {inspectedStudent.essay10?.part1_bentuk_apatisme || '-'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>2. Rancangan aksi, alasan &amp; harapan:</strong> {inspectedStudent.essay10?.part2_aksi_dan_alasan || '-'}
                </p>
              </div>
            </div>

            {/* FORM PENILAIAN & CATATAN KOMENTAR ADMIN */}
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-xs">📝</span>
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                      EVALUASI &amp; APRESIASI ADMIN
                    </span>
                    <h4 className="font-quest font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      Berikan Nilai Tambahan &amp; Catatan Komentar Esai (Soal 9 &amp; 10)
                    </h4>
                  </div>
                </div>
                {savedFeedbackAlert && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold animate-pop-in">
                    ✓ Nilai &amp; Catatan Admin Tersimpan!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evaluasi Soal 9 */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-quest font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                      Evaluasi Esai Soal 9 (Analisis Kasus)
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Maks. +100 Poin</span>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Nilai Tambahan Soal 9 (Poin / XP Bonus):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      step="5"
                      value={modGrade9}
                      onChange={(e) => setModGrade9(e.target.value)}
                      placeholder="Contoh: 85"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-mono text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Catatan Komentar Admin (Soal 9):
                    </label>
                    <textarea
                      rows={2}
                      value={modComment9}
                      onChange={(e) => setModComment9(e.target.value)}
                      placeholder="Tulis komentar/apresiasi atas analisis kasus transportasi mahasiswa ini..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-sans text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Evaluasi Soal 10 */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-quest font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                      Evaluasi Esai Soal 10 (Proyeksi Aksi)
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Maks. +100 Poin</span>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Nilai Tambahan Soal 10 (Poin / XP Bonus):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      step="5"
                      value={modGrade10}
                      onChange={(e) => setModGrade10(e.target.value)}
                      placeholder="Contoh: 90"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-600 focus:outline-none font-mono text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Catatan Komentar Admin (Soal 10):
                    </label>
                    <textarea
                      rows={2}
                      value={modComment10}
                      onChange={(e) => setModComment10(e.target.value)}
                      placeholder="Tulis komentar/masukan atas gagasan aksi edukasi kampus mahasiswa ini..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-600 focus:outline-none font-sans text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="font-mono text-xs text-amber-800 dark:text-amber-300">
                  💡 Nilai tambahan &amp; komentar akan tersimpan &amp; ikut tersinkron ke Google Sheets.
                </span>
                <button
                  type="button"
                  onClick={saveFeedback}
                  className="btn-3d btn-3d-amber px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Nilai &amp; Komentar Admin</span>
                </button>
              </div>
            </div>

            {/* Bagian A: Rincian Pilihan Ganda Soal 1 - 8 */}
            <div className="space-y-4">
              <h4 className="font-quest font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                ☑️ Bagian A — Rincian Jawaban Pilihan Ganda (Soal 1 – 8)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BAGIAN_A_QUESTIONS.map((q, idx) => {
                  const rec = (Array.isArray(inspectedStudent.mcqAnswers) && inspectedStudent.mcqAnswers[idx])
                    ? inspectedStudent.mcqAnswers[idx]
                    : { selectedOption: "-", isCorrect: false };
                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border ${
                        rec.isCorrect
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                      } text-xs`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Soal {q.id} ({q.category})</span>
                        <span>{rec.isCorrect ? '✓ Benar' : `✕ Salah (Kunci: ${q.correctLetter})`}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">
                        Dipilih: <strong>{rec.selectedOption}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStudentToDelete(inspectedStudent)}
                className="btn-3d btn-3d-rose px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title="Hapus data peserta ini dari tabel &amp; Supabase"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data Mahasiswa Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="btn-3d btn-3d-indigo px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
              >
                Tutup Detail Jawaban
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==============================================================
           MODAL: DIALOG KONFIRMASI HAPUS DATA MAHASISWA
           ============================================================== */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => !isDeleting && setStudentToDelete(null)} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 p-6 sm:p-7 shadow-2xl space-y-4 animate-pop-in">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shadow-xs shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 block">
                  KONFIRMASI HAPUS DATA
                </span>
                <h3 className="font-quest font-bold text-lg text-slate-900 dark:text-white">
                  Hapus Data Kuis Mahasiswa?
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data hasil pengerjaan kuis atas nama{' '}
              <strong className="text-slate-900 dark:text-white">
                {studentToDelete.studentName || studentToDelete.name}
              </strong>{' '}
              ({studentToDelete.studentClass || studentToDelete.className})?
            </p>

            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
              ⚠️ Data akan dihapus secara permanen dari penyimpanan lokal browser dan tabel database cloud <strong>Supabase</strong>.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                className="btn-3d btn-3d-neutral px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="btn-3d btn-3d-rose px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Sedang Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
