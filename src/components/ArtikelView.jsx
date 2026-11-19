import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  Award, 
  Check, 
  Copy, 
  ArrowUp, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function ArtikelView({ setView }) {
  // Reading & scroll metrics
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingTime, setReadingTime] = useState('~5 mnt baca');
  const [activeSection, setActiveSection] = useState('section-pengantar');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Font size scaler (-2 to +3)
  const [fontScale, setFontScale] = useState(0);

  // Hero SVG interactive caption
  const [heroCaption, setHeroCaption] = useState(
    '<strong class="text-paper-ink dark:text-night-ink">Kesenjangan Partisipasi:</strong> Klik pada megafon atau pilar grafik di atas untuk menelusuri mengapa 96,3% pemuda mengenal konsep partisipasi, namun hanya 19,2% yang terlibat langsung.'
  );

  // Module 1: Kritik vs Apatisme
  const [compMode, setCompMode] = useState('all'); // all | kritis | apatis
  const [scenarioFeedback, setScenarioFeedback] = useState(null);

  // Module 2: Data Visualization
  const [selectedDataStage, setSelectedDataStage] = useState('mengetahui');
  const [showMethodNote, setShowMethodNote] = useState(false);

  // Module 3: 4-Stage Public Policy Cycle
  const [selectedPolicyStep, setSelectedPolicyStep] = useState(0);

  // Module 4: Civic Action Checklist (6 items)
  const [checkedItems, setCheckedItems] = useState([false, false, false, false, false, false]);

  // Citation copy toast state
  const [copiedRefId, setCopiedRefId] = useState(null);

  const policyStepsData = [
    {
      num: 'TAHAP 01 DARI 04',
      title: 'Identifikasi Masalah',
      desc: 'Tahap paling awal ketika persoalan publik di tengah masyarakat mulai dikenali dan diangkat menjadi agenda pembahasan kebijakan.',
      citizenRole: 'Masyarakat berkepentingan memperoleh informasi yang transparan dan menyuarakan persoalan nyata yang mereka alami sehari-hari (seperti kendala biaya pendidikan, transportasi, kesehatan, atau lingkungan).'
    },
    {
      num: 'TAHAP 02 DARI 04',
      title: 'Perumusan Alternatif Penyelesaian',
      desc: 'Pemerintah dan pembentuk peraturan menyusun berbagai pilihan solusi atau rancangan kebijakan untuk menjawab masalah yang telah diidentifikasi.',
      citizenRole: 'Warga dan mahasiswa dapat mengikuti diskusi atau konsultasi publik serta memberikan masukan lisan maupun tertulis (daring/luring) agar alternatif solusi tepat sasaran.'
    },
    {
      num: 'TAHAP 03 DARI 04',
      title: 'Pengambilan Keputusan',
      desc: 'Tahap penentuan dan pengesahan kebijakan atau peraturan perundang-undangan oleh lembaga yang berwenang.',
      citizenRole: 'Berlakunya prinsip Meaningful Participation (Putusan MK No. 91/PUU-XVIII/2020): masyarakat berhak didengar (right to be heard), dipertimbangkan masukannya (right to be considered), dan mendapat penjelasan (right to be explained).'
    },
    {
      num: 'TAHAP 04 DARI 04',
      title: 'Pelaksanaan dan Evaluasi',
      desc: 'Kebijakan diterapkan di lapangan dan dinilai dampaknya terhadap kehidupan masyarakat luas.',
      citizenRole: 'Masyarakat dan mahasiswa tetap memiliki tanggung jawab mengawasi pemerintahan, melakukan kajian sederhana untuk mengawasi pelaksanaan kebijakan, dan menyampaikan evaluasi.'
    }
  ];

  const sectionTitles = {
    'section-pengantar': '01 • Ketika Suara Dianggap Tak Berarti',
    'section-kritik-vs-apatis': '02 • Kritik Bukanlah Apatisme',
    'section-data-pemuda': '03 • Kesenjangan Partisipasi Pemuda',
    'section-bilik-suara': '04 • Demokrasi Tak Berhenti di Bilik Suara',
    'section-landasan-hukum': '05 • Landasan Hukum & Putusan MK',
    'section-mahasiswa': '06 • Mahasiswa Bukan Sekadar Penonton',
    'section-referensi': '07 • Referensi & Dokumen Hukum'
  };

  // Scroll listener for reading progress & TOC scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setScrollProgress(progress);

      const sections = Object.keys(sectionTitles);
      let cur = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 190) {
            cur = id;
          }
        }
      }
      setActiveSection(cur);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic reading time on mount
  useEffect(() => {
    const articleEl = document.getElementById('articleBody');
    if (articleEl) {
      const text = articleEl.innerText || '';
      const wordCount = text.trim().split(/\s+/).length;
      const minutes = Math.max(3, Math.ceil(wordCount / 190));
      setReadingTime(`~${minutes} mnt baca`);
    }
  }, []);

  // Adjust font size style
  const baseRem = 1.1875;
  const currentFontSizeRem = (baseRem + fontScale * 0.09).toFixed(3);
  const currentFontPercent = Math.round((currentFontSizeRem / baseRem) * 100);

  const handleAdjustFontSize = (dir) => {
    if (dir === 0) {
      setFontScale(0);
    } else {
      setFontScale(prev => Math.max(-2, Math.min(3, prev + dir)));
    }
  };

  const handleHeroSvgClick = (key) => {
    const messages = {
      suara: '<strong class="text-crimson dark:text-crimson-bright">Suara & Kritik Warga:</strong> Menyampaikan kritik, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas merupakan bagian sah dari demokrasi, bukan apatisme.',
      mengenal: '<strong class="text-navy dark:text-blue-400">96,3% Mengenal Konsep:</strong> Dari 567 pemuda Indonesia usia 16–30 tahun yang diteliti (Putri dkk., 2025), hampir seluruhnya mengenal konsep partisipasi kebijakan publik.',
      memahami: '<strong class="text-paper-ink dark:text-night-ink">43,7% Memahami Proses:</strong> Kurang dari separuh responden yang memahami alur dan mekanisme bagaimana sebuah kebijakan publik dapat dipengaruhi.',
      terlibat: '<strong class="text-crimson dark:text-crimson-bright">19,2% Keterlibatan Langsung:</strong> Hanya sekitar 1 dari 5 pemuda dalam survei yang pernah terlibat langsung dalam proses kebijakan publik.'
    };
    if (messages[key]) {
      setHeroCaption(messages[key]);
    }
  };

  const handleScenarioQuiz = (caseNum) => {
    if (caseNum === 1) {
      setScenarioFeedback(
        '<strong class="text-crimson dark:text-crimson-bright">Analisis Kasus A — Gejala Apatisme Politik:</strong> Merasa tidak setuju terhadap kebijakan tetapi memilih untuk mengabaikannya karena merasa suaranya tidak akan didengar adalah bentuk melemahnya <em>political efficacy</em> yang berujung pada apatisme.'
      );
    } else {
      setScenarioFeedback(
        '<strong class="text-emerald-600 dark:text-emerald-400">Analisis Kasus B — Partisipasi Demokratis (Bukan Apatisme):</strong> Mengkritik pemerintah, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas justru merupakan wujud kepedulian dan bagian penting dari kehidupan demokrasi.'
      );
    }
  };

  const handleToggleChecklist = (idx) => {
    setCheckedItems(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const checkedCount = checkedItems.filter(Boolean).length;
  const checklistPct = Math.round((checkedCount / 6) * 100);

  const handleCopyCitation = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedRefId(id);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  return (
    <div className="paper-grain antialiased text-paper-ink dark:text-night-ink bg-paper-light dark:bg-night-bg transition-colors duration-300">
      
      {/* TOP READING PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div 
          className="h-full bg-crimson dark:bg-crimson-bright transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* EDITORIAL SUB-NAVBAR CONTROLS */}
      <div className="sticky top-16 z-30 border-b border-paper-border dark:border-night-border bg-paper-light/95 dark:bg-night-bg/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          
          {/* Left: Section Indicator & Quick Nav */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setView('portal')}
              className="inline-flex items-center gap-1.5 font-bold text-xs text-paper-muted dark:text-night-muted hover:text-crimson transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>
            <span className="text-paper-border dark:text-night-border">|</span>
            <span className="hidden md:inline-block font-sans text-xs font-semibold text-paper-muted dark:text-night-muted truncate max-w-sm">
              {sectionTitles[activeSection] || 'Edisi Khusus • Esai Interaktif'}
            </span>
          </div>

          {/* Right: Reading Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-xs font-mono text-paper-muted dark:text-night-muted">
              <Clock className="w-3.5 h-3.5 text-crimson dark:text-crimson-bright" />
              <span>{readingTime}</span>
            </div>

            {/* Font Size Scaler */}
            <div className="flex items-center rounded-lg bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-0.5">
              <button 
                onClick={() => handleAdjustFontSize(-1)}
                title="Perkecil ukuran teks" 
                className="px-2 py-0.5 text-xs font-sans font-bold text-paper-muted dark:text-night-muted hover:text-paper-ink rounded transition-colors"
              >
                A-
              </button>
              <span className="text-paper-border dark:text-night-border text-xs">|</span>
              <button 
                onClick={() => handleAdjustFontSize(0)}
                title="Ukuran teks standar" 
                className="px-1.5 py-0.5 text-[11px] font-mono text-paper-muted dark:text-night-muted hover:text-crimson rounded transition-colors"
              >
                {currentFontPercent}%
              </button>
              <span className="text-paper-border dark:text-night-border text-xs">|</span>
              <button 
                onClick={() => handleAdjustFontSize(1)}
                title="Perbesar ukuran teks" 
                className="px-2 py-0.5 text-sm font-sans font-bold text-paper-muted dark:text-night-muted hover:text-paper-ink rounded transition-colors"
              >
                A+
              </button>
            </div>

            {/* Mobile TOC Drawer Button */}
            <button 
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="lg:hidden p-2 rounded-lg bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border text-paper-ink dark:text-night-ink"
              aria-label="Daftar Isi"
            >
              {mobileTocOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE TABLE OF CONTENTS DRAWER */}
      {mobileTocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setMobileTocOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>
          <div className="fixed bottom-0 left-0 right-0 bg-paper-light dark:bg-night-card border-t border-paper-border dark:border-night-border rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-paper-border dark:border-night-border">
              <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">Daftar Isi Artikel</span>
              <button onClick={() => setMobileTocOpen(false)} className="p-1.5 rounded-lg text-paper-muted hover:text-paper-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-3 font-sans text-sm">
              {Object.keys(sectionTitles).map(secId => (
                <a 
                  key={secId}
                  href={`#${secId}`} 
                  onClick={() => setMobileTocOpen(false)} 
                  className={`block py-2 px-3 rounded-lg font-medium ${
                    activeSection === secId ? 'bg-paper-elevated dark:bg-night-elevated text-crimson font-bold' : 'hover:bg-paper-card'
                  }`}
                >
                  {sectionTitles[secId]}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* HERO MAGAZINE COVER SECTION */}
      <section id="hero" className="relative border-b border-paper-border dark:border-night-border overflow-hidden pt-10 pb-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Cover Typography (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-crimson text-white font-mono text-xs uppercase tracking-widest font-semibold">
                  Esai Utama • Kewarganegaraan
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-paper-muted dark:text-night-muted">
                  Laporan Visual Interaktif
                </span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl xl:text-6xl text-paper-ink dark:text-night-ink tracking-tight leading-[1.08]">
                Apatisme Publik: <br className="hidden sm:inline" />
                <span className="italic font-normal text-crimson dark:text-crimson-bright">Ketika Masyarakat Merasa</span> Suaranya Tak Lagi Berarti
              </h1>

              <p className="font-serif text-xl sm:text-2xl text-paper-muted dark:text-night-muted leading-relaxed border-l-4 border-crimson dark:border-crimson-bright pl-5 py-1">
                Demokrasi tidak hanya tentang memilih pemimpin, tetapi juga tentang bagaimana masyarakat memahami, mengawasi, dan turut memengaruhi kebijakan yang menentukan kehidupan bersama.
              </p>

              <div className="pt-4 border-t border-paper-border dark:border-night-border grid grid-cols-3 gap-4 max-w-xl">
                <div>
                  <span className="block font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Responden Riset</span>
                  <span className="font-display font-bold text-xl sm:text-2xl text-paper-ink dark:text-night-ink">567 Pemuda</span>
                  <span className="block font-sans text-[11px] text-paper-muted dark:text-night-muted">Usia 16–30 Tahun (2025)</span>
                </div>
                <div className="border-l border-paper-border dark:border-night-border pl-4">
                  <span className="block font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Pemilih Pilpres</span>
                  <span className="font-display font-bold text-xl sm:text-2xl text-crimson dark:text-crimson-bright">81,48%</span>
                  <span className="block font-sans text-[11px] text-paper-muted dark:text-night-muted">Keputusan KPU 1043/2024</span>
                </div>
                <div className="border-l border-paper-border dark:border-night-border pl-4">
                  <span className="block font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Payung Hukum</span>
                  <span className="font-display font-bold text-xl sm:text-2xl text-paper-ink dark:text-night-ink">3 Hak Utama</span>
                  <span className="block font-sans text-[11px] text-paper-muted dark:text-night-muted">Meaningful Participation</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Editorial Vector Artwork (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-6 sm:p-8 shadow-sm group">
                
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper-border dark:border-night-border">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-paper-muted dark:text-night-muted">
                    FIG. 01 — ARSITEKTUR SUARA PUBLIK
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-crimson dark:text-crimson-bright">
                    <span className="w-2 h-2 rounded-full bg-crimson animate-ping"></span>
                    Sentuh Elemen Visual
                  </span>
                </div>

                {/* Vector SVG */}
                <div className="relative w-full aspect-[4/3] select-none">
                  <svg id="heroEditorialSvg" viewBox="0 0 500 380" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="editorialGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-paper-border dark:text-night-border" />
                      </pattern>
                    </defs>

                    <rect width="500" height="380" fill="url(#editorialGrid)" rx="12" />
                    <circle cx="340" cy="185" r="115" className="fill-paper-elevated dark:fill-night-elevated transition-all duration-500" />
                    <circle cx="340" cy="185" r="85" fill="none" stroke="#C8102E" strokeWidth="1.5" strokeDasharray="4 4" className="animate-subtle-pulse" />

                    {/* Megaphone */}
                    <g className="cursor-pointer transition-transform duration-300 hover:translate-x-1" onClick={() => handleHeroSvgClick('suara')}>
                      <polygon points="45,175 125,135 125,235 45,195" fill="#141413" className="dark:fill-paper-light" />
                      <rect x="28" y="168" width="20" height="34" rx="4" fill="#C8102E" />
                      <path d="M 55 195 L 70 245 L 92 245 L 82 195 Z" fill="#5C5A55" />
                    </g>

                    {/* Acoustic Waves */}
                    <g stroke="#C8102E" fill="none" strokeLinecap="round">
                      <path d="M 145 145 Q 168 185 145 225" strokeWidth="3" />
                      <path d="M 168 125 Q 200 185 168 245" strokeWidth="2.5" strokeDasharray="6 4" />
                      <path d="M 192 105 Q 235 185 192 265" strokeWidth="1.75" opacity="0.7" />
                    </g>

                    {/* Pillar 1: 96.3% */}
                    <g className="cursor-pointer group/bar" onClick={() => handleHeroSvgClick('mengenal')}>
                      <rect x="240" y="70" width="48" height="230" rx="4" fill="#1B365D" className="transition-all duration-300 hover:opacity-90" />
                      <text x="264" y="58" textAnchor="middle" className="font-mono text-[11px] font-bold fill-current text-paper-ink dark:text-night-ink">96,3%</text>
                      <text x="264" y="285" textAnchor="middle" className="font-mono text-[9px] fill-white tracking-wider">KENAL</text>
                    </g>

                    {/* Pillar 2: 43.7% */}
                    <g className="cursor-pointer group/bar" onClick={() => handleHeroSvgClick('memahami')}>
                      <rect x="315" y="185" width="48" height="115" rx="4" fill="#5C5A55" className="transition-all duration-300 hover:opacity-90" />
                      <rect x="315" y="70" width="48" height="110" rx="4" fill="none" stroke="#5C5A55" strokeWidth="1.2" strokeDasharray="3 3" />
                      <text x="339" y="175" textAnchor="middle" className="font-mono text-[11px] font-bold fill-current text-paper-ink dark:text-night-ink">43,7%</text>
                      <text x="339" y="285" textAnchor="middle" className="font-mono text-[9px] fill-white tracking-wider">PAHAM</text>
                    </g>

                    {/* Pillar 3: 19.2% */}
                    <g className="cursor-pointer group/bar" onClick={() => handleHeroSvgClick('terlibat')}>
                      <rect x="390" y="242" width="48" height="58" rx="4" fill="#C8102E" className="transition-all duration-300 hover:opacity-90" />
                      <rect x="390" y="70" width="48" height="167" rx="4" fill="none" stroke="#C8102E" strokeWidth="1.2" strokeDasharray="3 3" />
                      <text x="414" y="232" textAnchor="middle" className="font-mono text-[11px] font-bold fill-[#C8102E]">19,2%</text>
                      <text x="414" y="285" textAnchor="middle" className="font-mono text-[9px] fill-white tracking-wider">AKSI</text>
                    </g>

                    <rect x="220" y="302" width="240" height="12" rx="2" className="fill-paper-ink dark:fill-night-ink" />
                    <text x="340" y="335" textAnchor="middle" className="font-mono text-[10px] uppercase tracking-widest fill-current text-paper-muted dark:text-night-muted">
                      PASAL 96 UU 13/2022 • PUTUSAN MK 91/2020
                    </text>
                  </svg>
                </div>

                {/* Feedback Box */}
                <div className="mt-4 pt-3 border-t border-paper-border dark:border-night-border text-xs font-sans text-paper-muted dark:text-night-muted flex items-start gap-2.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-crimson mt-1.5 shrink-0"></span>
                  <p dangerouslySetInnerHTML={{ __html: heroCaption }} />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN EDITORIAL LAYOUT: STICKY SIDEBAR + ARTICLE COLUMN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN: DESKTOP STICKY TOC & GLOSSARY (3 COLS) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-8">
              
              <div className="p-5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border">
                <div className="economist-rubric-bar">
                  <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-paper-ink dark:text-night-ink">
                    Daftar Isi Editorial
                  </h2>
                </div>
                <nav className="mt-4 space-y-1.5 font-sans text-xs">
                  {Object.keys(sectionTitles).map((secId, i) => (
                    <a
                      key={secId}
                      href={`#${secId}`}
                      className={`toc-link flex items-center gap-2.5 py-2 px-2.5 rounded-lg transition-all ${
                        activeSection === secId
                          ? 'text-crimson dark:text-crimson-bright font-bold bg-paper-elevated/70 dark:bg-night-elevated/70'
                          : 'text-paper-muted dark:text-night-muted hover:text-paper-ink dark:hover:text-night-ink'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-75">0{i + 1}</span>
                      <span className="truncate">{sectionTitles[secId].replace(/^\d+\s•\s/, '')}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Glossary Card */}
              <div className="p-5 rounded-xl border border-paper-border dark:border-night-border bg-paper-light dark:bg-night-bg space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                  Kamus Politik Ringkas
                </span>
                <h3 className="font-display font-bold text-base text-paper-ink dark:text-night-ink">
                  Apa itu Political Efficacy?
                </h3>
                <p className="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">
                  Keyakinan bahwa seseorang mampu memahami dan berpartisipasi dalam politik serta bahwa suaranya berpotensi membawa pengaruh.
                </p>
              </div>

              {/* Link to Quiz */}
              <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-300 font-bold">
                  Arena Gamifikasi
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Uji Pemahaman Materi Ini
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tantang dirimu di 8 soal pilihan ganda dan 2 studi kasus esai di Civic Quest!
                </p>
                <button
                  onClick={() => setView('kuis')}
                  className="btn-3d btn-3d-indigo w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Buka Civic Quest</span>
                </button>
              </div>

            </div>
          </aside>

          {/* RIGHT/CENTER COLUMN: ARTICLE BODY (9 COLS) */}
          <article 
            id="articleBody" 
            className="lg:col-span-9 max-w-[72ch] mx-auto lg:mx-0 space-y-16"
            style={{ '--body-font-size': `${currentFontSizeRem}rem` }}
          >

            {/* ==========================================
                 SECTION 01: PENGANTAR
                 ========================================== */}
            <section id="section-pengantar" className="scroll-mt-28 article-prose">
              <p className="editorial-dropcap font-serif text-paper-ink dark:text-night-ink">
                Pernahkah kamu membaca berita mengenai kebijakan pemerintah, merasa tidak setuju, tetapi akhirnya memilih untuk mengabaikannya? Atau mendengar seseorang berkata, <em>"Untuk apa menyampaikan pendapat? Toh, pemerintah belum tentu mendengarkan."</em> Sekilas, sikap tersebut mungkin terlihat biasa. Namun, apabila ketidakpedulian semacam ini terus berkembang, muncul persoalan yang lebih besar: apakah masyarakat masih merasa memiliki peran dalam menentukan arah negaranya?
              </p>

              <figure className="my-10 py-8 px-6 sm:px-10 rounded-2xl bg-paper-card dark:bg-night-card border-l-4 border-crimson dark:border-crimson-bright relative overflow-hidden">
                <svg className="w-16 h-16 text-crimson/10 dark:text-crimson-bright/10 absolute top-4 right-6 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <blockquote className="font-display italic font-semibold text-2xl sm:text-3xl text-paper-ink dark:text-night-ink leading-snug relative z-10">
                  “Untuk apa menyampaikan pendapat? Toh, pemerintah belum tentu mendengarkan.”
                </blockquote>
                <figcaption className="mt-4 font-sans text-xs uppercase tracking-wider text-paper-muted dark:text-night-muted">
                  — Gejala percakapan sehari-hari yang menandai melemahnya efikasi politik warga
                </figcaption>
              </figure>

              <p className="font-serif text-paper-ink dark:text-night-ink">
                Fenomena tersebut berkaitan dengan <strong className="font-semibold text-crimson dark:text-crimson-bright">apatisme politik</strong>, yaitu sikap kurang tertarik atau tidak peduli terhadap persoalan dan proses politik. Sikap ini dapat terlihat ketika seseorang tidak lagi berusaha mengikuti perkembangan kebijakan, memahami persoalan publik, ataupun menggunakan kesempatan untuk berpartisipasi.
              </p>
            </section>

            {/* ==========================================
                 SECTION 02: KRITIK BUKAN APATISME
                 ========================================== */}
            <section id="section-kritik-vs-apatis" className="scroll-mt-28 space-y-8">
              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Namun, ada satu hal yang perlu diluruskan: <strong className="underline decoration-crimson decoration-2 underline-offset-4">mengkritik pemerintah bukanlah bentuk apatisme.</strong> Justru, menyampaikan kritik, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas merupakan bagian dari kehidupan demokrasi. Apatisme lebih terlihat ketika seseorang memilih tidak peduli terhadap persoalan publik dan merasa tidak perlu mengambil bagian di dalamnya.
                </p>
              </div>

              {/* MODULE 1: KRITIK VS APATISME EXPLORER */}
              <div className="rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-border dark:border-night-border">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                      INSTRUMEN KONSEPTUAL 01
                    </span>
                    <h3 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink mt-1">
                      Membedakan Sikap Kritis vs. Apatisme Politik
                    </h3>
                  </div>
                  <div className="inline-flex rounded-xl bg-paper-light dark:bg-night-bg p-1 border border-paper-border dark:border-night-border self-start">
                    <button 
                      onClick={() => setCompMode('all')} 
                      className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all ${compMode === 'all' ? 'bg-crimson text-white' : 'text-paper-muted hover:text-paper-ink'}`}
                    >
                      Sandingkan
                    </button>
                    <button 
                      onClick={() => setCompMode('kritis')} 
                      className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all ${compMode === 'kritis' ? 'bg-crimson text-white' : 'text-paper-muted hover:text-paper-ink'}`}
                    >
                      Sikap Kritis
                    </button>
                    <button 
                      onClick={() => setCompMode('apatis')} 
                      className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all ${compMode === 'apatis' ? 'bg-crimson text-white' : 'text-paper-muted hover:text-paper-ink'}`}
                    >
                      Sikap Apatis
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className={`grid gap-6 mt-6 ${compMode === 'all' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  
                  {/* Card: Sikap Kritis */}
                  {(compMode === 'all' || compMode === 'kritis') && (
                    <div className="rounded-xl bg-paper-light dark:bg-night-bg border-2 border-navy/30 dark:border-blue-400/30 p-5 space-y-4 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-navy text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                          Partisipasi Aktif
                        </span>
                        <span className="font-mono text-xs text-navy dark:text-blue-300 font-semibold">Bagian Kehidupan Demokrasi</span>
                      </div>
                      <h4 className="font-display font-bold text-xl text-paper-ink dark:text-night-ink">
                        Mengkritik &amp; Menguji Kebijakan
                      </h4>
                      <p className="font-sans text-sm text-paper-muted dark:text-night-muted leading-relaxed">
                        Berangkat dari rasa peduli terhadap kepentingan bersama. Warga mengikuti perkembangan isu dan menggunakan nalar publiknya.
                      </p>
                      <ul className="space-y-2.5 pt-2 border-t border-paper-border dark:border-night-border font-sans text-xs text-paper-ink dark:text-night-ink">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>Menyampaikan kritik terhadap program atau regulasi pemerintah.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>Mempertanyakan keputusan pejabat publik secara terbuka.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                          <span>Menolak kebijakan dengan alasan dan argumen yang jelas.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Card: Sikap Apatis */}
                  {(compMode === 'all' || compMode === 'apatis') && (
                    <div className="rounded-xl bg-paper-light dark:bg-night-bg border-2 border-crimson/30 p-5 space-y-4 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-crimson text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                          Ketidakpedulian
                        </span>
                        <span className="font-mono text-xs text-crimson dark:text-crimson-bright font-semibold">Ancaman Kualitas Demokrasi</span>
                      </div>
                      <h4 className="font-display font-bold text-xl text-paper-ink dark:text-night-ink">
                        Apatisme Politik
                      </h4>
                      <p className="font-sans text-sm text-paper-muted dark:text-night-muted leading-relaxed">
                        Sikap kurang tertarik atau tidak peduli terhadap persoalan dan proses politik karena merasa tidak perlu mengambil bagian di dalamnya.
                      </p>
                      <ul className="space-y-2.5 pt-2 border-t border-paper-border dark:border-night-border font-sans text-xs text-paper-ink dark:text-night-ink">
                        <li className="flex items-start gap-2">
                          <span className="text-crimson dark:text-crimson-bright font-bold">✕</span>
                          <span>Tidak lagi berusaha mengikuti perkembangan kebijakan publik.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-crimson dark:text-crimson-bright font-bold">✕</span>
                          <span>Enggan memahami persoalan publik yang berdampak pada masyarakat.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-crimson dark:text-crimson-bright font-bold">✕</span>
                          <span>Mengabaikan kesempatan berpartisipasi walaupun merasa tidak setuju.</span>
                        </li>
                      </ul>
                    </div>
                  )}

                </div>

                {/* Scenario Quiz */}
                <div className="mt-6 pt-5 border-t border-paper-border dark:border-night-border">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-paper-muted dark:text-night-muted block mb-3">
                    Uji Kasus Singkat: Klik situasi di bawah untuk melihat klasifikasinya
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleScenarioQuiz(1)} 
                      className="text-left p-3.5 rounded-xl bg-paper-elevated/60 dark:bg-night-elevated/60 hover:bg-paper-elevated dark:hover:bg-night-elevated border border-paper-border dark:border-night-border transition-all cursor-pointer"
                    >
                      <span className="block font-mono text-[10px] uppercase text-crimson dark:text-crimson-bright font-bold">Kasus A</span>
                      <span className="font-sans text-xs font-medium text-paper-ink dark:text-night-ink mt-1 block">
                        “Membaca berita kenaikan biaya pendidikan, tidak setuju, lalu menutup berita dan memilih diam.”
                      </span>
                    </button>
                    <button 
                      onClick={() => handleScenarioQuiz(2)} 
                      className="text-left p-3.5 rounded-xl bg-paper-elevated/60 dark:bg-night-elevated/60 hover:bg-paper-elevated dark:hover:bg-night-elevated border border-paper-border dark:border-night-border transition-all cursor-pointer"
                    >
                      <span className="block font-mono text-[10px] uppercase text-navy dark:text-blue-400 font-bold">Kasus B</span>
                      <span className="font-sans text-xs font-medium text-paper-ink dark:text-night-ink mt-1 block">
                        “Membuat kajian singkat dan menolak rancangan peraturan daerah dengan alasan tertulis yang jelas.”
                      </span>
                    </button>
                  </div>
                  {scenarioFeedback && (
                    <div 
                      className="mt-3 p-3.5 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border font-sans text-xs text-paper-ink dark:text-night-ink"
                      dangerouslySetInnerHTML={{ __html: scenarioFeedback }}
                    />
                  )}
                </div>

              </div>
            </section>

            {/* ==========================================
                 SECTION 03: DATA RISET PEMUDA
                 ========================================== */}
            <section id="section-data-pemuda" className="scroll-mt-28 space-y-8">
              <div className="economist-rubric-bar">
                <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                  TEMUAN RISET &amp; KESENJANGAN KAPASITAS
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-paper-ink dark:text-night-ink mt-1 leading-tight">
                  Bukan Tidak Tahu Politik, tetapi Belum Memahami Cara Berpartisipasi
                </h2>
              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Menariknya, persoalan partisipasi tidak selalu muncul karena generasi muda sama sekali tidak mengenal politik. Penelitian <strong>Putri, Marlina, dan Zain (2025)</strong> dalam jurnal <em>Administratio</em> terhadap <strong>567 pemuda Indonesia berusia 16–30 tahun</strong> menemukan bahwa <strong>96,3%</strong> responden mengenal konsep partisipasi kebijakan publik. Namun, hanya <strong>43,7%</strong> yang memahami prosesnya, sedangkan keterlibatan langsung tercatat sebesar <strong>19,2%</strong>.
                </p>
              </div>

              {/* INTERACTIVE DATA VISUALIZATION */}
              <div className="rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-paper-border dark:border-night-border pb-5">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                      INFOGRAFIS INTERAKTIF • N = 567 PEMUDA (16–30 TAHUN)
                    </span>
                    <h3 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink mt-1">
                      Jurang Antara Mengetahui, Memahami, dan Melakukan
                    </h3>
                    <p className="font-sans text-xs text-paper-muted dark:text-night-muted mt-1">
                      Sumber: Putri, Marlina, &amp; Zain (2025), Jurnal <em>Administratio</em> Vol. 16 No. 2. Klik setiap tahapan untuk melihat analisis.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMethodNote(!showMethodNote)} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border font-mono text-xs text-paper-ink dark:text-night-ink hover:border-crimson transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Catatan Metodologis</span>
                  </button>
                </div>

                {/* Horizontal Funnel Bars */}
                <div className="space-y-5">
                  
                  {/* Bar 1 */}
                  <div 
                    onClick={() => setSelectedDataStage('mengetahui')} 
                    className={`cursor-pointer p-4 rounded-xl bg-paper-light dark:bg-night-bg transition-all ${
                      selectedDataStage === 'mengetahui' ? 'border-2 border-crimson' : 'border border-paper-border dark:border-night-border hover:border-crimson/60'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="font-mono text-xs uppercase font-bold text-navy dark:text-blue-400">TAHAP 1 • MENGETAHUI</span>
                        <h4 className="font-sans font-bold text-base text-paper-ink dark:text-night-ink">Mengenal Konsep Partisipasi Kebijakan Publik</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-2xl sm:text-3xl text-paper-ink dark:text-night-ink">96,3%</span>
                        <span className="block font-mono text-[11px] text-paper-muted dark:text-night-muted">~546 dari 567 responden</span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-paper-elevated dark:bg-night-elevated rounded-full overflow-hidden">
                      <div className="bar-fill h-full bg-navy dark:bg-blue-500 rounded-full" style={{ width: '96.3%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4">
                    <div className="h-5 border-l-2 border-dashed border-crimson"></div>
                    <span className="font-mono text-xs text-crimson dark:text-crimson-bright font-semibold">
                      ▼ Menyusut 52,6 poin persentase dari sekadar mengenal ke memahami proses
                    </span>
                  </div>

                  {/* Bar 2 */}
                  <div 
                    onClick={() => setSelectedDataStage('memahami')} 
                    className={`cursor-pointer p-4 rounded-xl bg-paper-light dark:bg-night-bg transition-all ${
                      selectedDataStage === 'memahami' ? 'border-2 border-crimson' : 'border border-paper-border dark:border-night-border hover:border-crimson/60'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="font-mono text-xs uppercase font-bold text-paper-muted dark:text-night-muted">TAHAP 2 • MEMAHAMI</span>
                        <h4 className="font-sans font-bold text-base text-paper-ink dark:text-night-ink">Memahami Proses &amp; Mekanisme Partisipasi</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-2xl sm:text-3xl text-paper-ink dark:text-night-ink">43,7%</span>
                        <span className="block font-mono text-[11px] text-paper-muted dark:text-night-muted">~248 dari 567 responden</span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-paper-elevated dark:bg-night-elevated rounded-full overflow-hidden">
                      <div className="bar-fill h-full bg-amber-600 dark:bg-amber-500 rounded-full" style={{ width: '43.7%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4">
                    <div className="h-5 border-l-2 border-dashed border-crimson"></div>
                    <span className="font-mono text-xs text-crimson dark:text-crimson-bright font-semibold">
                      ▼ Menyusut lagi 24,5 poin persentase saat harus terlibat secara langsung
                    </span>
                  </div>

                  {/* Bar 3 */}
                  <div 
                    onClick={() => setSelectedDataStage('melakukan')} 
                    className={`cursor-pointer p-4 rounded-xl bg-paper-light dark:bg-night-bg transition-all ${
                      selectedDataStage === 'melakukan' ? 'border-2 border-crimson' : 'border border-paper-border dark:border-night-border hover:border-crimson/60'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="font-mono text-xs uppercase font-bold text-crimson dark:text-crimson-bright">TAHAP 3 • MELAKUKAN</span>
                        <h4 className="font-sans font-bold text-base text-paper-ink dark:text-night-ink">Keterlibatan Langsung dalam Proses Kebijakan</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-2xl sm:text-3xl text-crimson dark:text-crimson-bright">19,2%</span>
                        <span className="block font-mono text-[11px] text-paper-muted dark:text-night-muted">~109 dari 567 responden</span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-paper-elevated dark:bg-night-elevated rounded-full overflow-hidden">
                      <div className="bar-fill h-full bg-crimson dark:bg-crimson-bright rounded-full" style={{ width: '19.2%' }}></div>
                    </div>
                  </div>

                </div>

                {/* Stage Detail Box */}
                <div className="p-4 rounded-xl bg-paper-elevated/70 dark:bg-night-elevated/70 border border-paper-border dark:border-night-border font-sans text-sm text-paper-ink dark:text-night-ink">
                  {selectedDataStage === 'mengetahui' && (
                    <>
                      <strong className="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 1 (96,3% — Mengenal Konsep):</strong>
                      Mayoritas mutlak pemuda berusia 16–30 tahun yang diteliti sudah mengenal istilah dan konsep bahwa masyarakat memiliki hak untuk menyampaikan aspirasi dalam kebijakan publik. Artinya, generasi muda sama sekali tidak buta politik.
                    </>
                  )}
                  {selectedDataStage === 'memahami' && (
                    <>
                      <strong className="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 2 (43,7% — Memahami Proses):</strong>
                      Terjadi penurunan tajam. Seseorang mungkin mengetahui bahwa masyarakat berhak menyampaikan aspirasi, tetapi belum tentu memahami kepada siapa aspirasi harus disampaikan atau bagaimana proses kebijakan dapat dipengaruhi.
                    </>
                  )}
                  {selectedDataStage === 'melakukan' && (
                    <>
                      <strong className="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 3 (19,2% — Keterlibatan Langsung):</strong>
                      Hanya 19,2% responden yang tercatat pernah terlibat langsung. Selain kendala pemahaman prosedur, rendahnya keterlibatan langsung juga dipengaruhi oleh rasa tidak percaya atau rendahnya <em>political efficacy</em>.
                    </>
                  )}
                </div>

                {showMethodNote && (
                  <div className="p-4 rounded-xl bg-paper-light dark:bg-night-bg border-l-4 border-amber-600 font-sans text-xs text-paper-muted dark:text-night-muted space-y-1.5 animate-pop-in">
                    <div className="font-bold text-paper-ink dark:text-night-ink uppercase font-mono">Catatan Metodologis Penelitian:</div>
                    <p>
                      Penelitian Putri, Marlina, dan Zain (2025) menggunakan metode <em>convenience sampling</em> terhadap 567 pemuda berusia 16–30 tahun, sehingga hasilnya tidak dapat dianggap mewakili seluruh pemuda Indonesia secara populasi. Meski demikian, temuan ini secara tajam menunjukkan adanya kesenjangan nyata antara <strong>mengetahui</strong>, <strong>memahami</strong>, dan <strong>melakukan</strong>.
                    </p>
                  </div>
                )}

              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Penelitian tersebut menggunakan metode <em>convenience sampling</em>, sehingga hasilnya tidak dapat dianggap mewakili seluruh pemuda Indonesia. Meski demikian, temuan ini menunjukkan adanya kesenjangan antara mengetahui, memahami, dan melakukan. Seseorang mungkin mengetahui bahwa masyarakat memiliki hak untuk menyampaikan aspirasi, tetapi belum tentu memahami kepada siapa aspirasi harus disampaikan atau bagaimana proses kebijakan dapat dipengaruhi.
                </p>
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Selain keterbatasan pemahaman, rasa tidak percaya juga dapat menjadi penghambat. Ketika masyarakat merasa pendapatnya tidak akan dipertimbangkan, keinginan untuk berpartisipasi dapat melemah. Dalam kajian politik, hal ini berkaitan dengan <strong className="text-crimson dark:text-crimson-bright">political efficacy</strong> atau <strong>efikasi politik</strong>, yaitu keyakinan bahwa seseorang mampu memahami dan berpartisipasi dalam politik serta bahwa suaranya berpotensi membawa pengaruh.
                </p>
              </div>

              {/* Spotlight Card: 2 Dimensions */}
              <div className="p-6 rounded-2xl bg-navy text-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                    KONSEP KUNCI ILMU POLITIK
                  </span>
                  <span className="font-mono text-xs text-blue-200">Efikasi Politik</span>
                </div>
                <h3 className="font-display font-bold text-2xl">
                  Dua Wajah Political Efficacy (Efikasi Politik)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="font-mono text-xs text-amber-300 uppercase font-bold">01. Dimensi Internal</span>
                    <h4 className="font-sans font-bold text-base mt-1">Keyakinan Memahami &amp; Bertindak</h4>
                    <p className="font-sans text-xs text-blue-100 mt-1.5 leading-relaxed">
                      Keyakinan warga bahwa dirinya memiliki pengetahuan yang cukup untuk memahami persoalan kebijakan dan tahu cara berpartisipasi.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                    <span className="font-mono text-xs text-amber-300 uppercase font-bold">02. Dimensi Eksternal</span>
                    <h4 className="font-sans font-bold text-base mt-1">Keyakinan Suaranya Didengar</h4>
                    <p className="font-sans text-xs text-blue-100 mt-1.5 leading-relaxed">
                      Keyakinan bahwa institusi pemerintah akan merespons dan mempertimbangkan aspirasi sehingga suara warga berpotensi membawa pengaruh.
                    </p>
                  </div>
                </div>
              </div>

            </section>

            {/* ==========================================
                 SECTION 04: BILIK SUARA
                 ========================================== */}
            <section id="section-bilik-suara" className="scroll-mt-28 space-y-8">
              <div className="economist-rubric-bar">
                <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                  PARTISIPASI PASCA-PEMILU
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-paper-ink dark:text-night-ink mt-1 leading-tight">
                  Demokrasi Tidak Berhenti di Bilik Suara
                </h2>
              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Partisipasi dalam pemilihan umum memang penting. Pada Pemilu 2024, tingkat partisipasi pemilih dalam Pemilihan Presiden dan Wakil Presiden mencapai <strong>81,48%</strong>, berdasarkan <strong>Keputusan KPU Nomor 1043 Tahun 2024</strong>. Angka ini menunjukkan bahwa sebagian besar pemilih telah menggunakan hak pilihnya.
                </p>
              </div>

              {/* Big Stat Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-paper-border dark:border-night-border shadow-sm">
                <div className="md:col-span-5 bg-crimson text-white p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-red-100 font-bold">
                      KEPUTUSAN KPU NO. 1043 TAHUN 2024
                    </span>
                    <div className="font-display font-black text-5xl sm:text-6xl mt-3 tracking-tight">
                      81,48%
                    </div>
                    <p className="font-sans text-sm font-semibold text-red-100 mt-2">
                      Tingkat Partisipasi Pemilih dalam Pemilihan Presiden &amp; Wakil Presiden 2024
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20 font-mono text-[11px] text-red-100">
                    Momentum Elektoral 5 Tahunan
                  </div>
                </div>

                <div className="md:col-span-7 bg-paper-card dark:bg-night-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-crimson dark:text-crimson-bright font-bold">
                      Tanggung Jawab Setelah Pemimpin Terpilih
                    </span>
                    <h3 className="font-display font-bold text-xl text-paper-ink dark:text-night-ink">
                      Mengawasi Kebijakan yang Menyentuh Hidup Sehari-hari
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-paper-muted dark:text-night-muted leading-relaxed">
                      Angka 81,48% hanya mengukur penggunaan hak pilih pada hari pemungutan suara. Setelah itu, keputusan pemerintah memengaruhi warga secara langsung pada empat sektor krusial:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-crimson shrink-0"></span>
                      <span className="font-sans text-xs font-bold text-paper-ink dark:text-night-ink">Biaya Pendidikan</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-navy dark:bg-blue-400 shrink-0"></span>
                      <span className="font-sans text-xs font-bold text-paper-ink dark:text-night-ink">Transportasi Publik</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0"></span>
                      <span className="font-sans text-xs font-bold text-paper-ink dark:text-night-ink">Pelayanan Kesehatan</span>
                    </div>
                    <div className="p-3 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                      <span className="font-sans text-xs font-bold text-paper-ink dark:text-night-ink">Pengelolaan Lingkungan</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Namun, angka tersebut hanya mengukur penggunaan hak pilih pada hari pemungutan suara, bukan seluruh bentuk keterlibatan masyarakat dalam kehidupan demokrasi. Setelah pemimpin terpilih, masyarakat tetap memiliki tanggung jawab untuk mengawasi pemerintahan, memberikan masukan, dan mengevaluasi kebijakan.
                </p>
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Mengapa hal ini penting? Karena kebijakan publik sangat dekat dengan kehidupan sehari-hari. Keputusan mengenai biaya pendidikan, transportasi, pelayanan kesehatan, hingga pengelolaan lingkungan dapat memengaruhi masyarakat secara langsung.
                </p>
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Sebuah kebijakan juga tidak muncul begitu saja. Secara sederhana, prosesnya dimulai dari identifikasi masalah, dilanjutkan dengan perumusan alternatif penyelesaian, pengambilan keputusan, hingga pelaksanaan dan evaluasi. Pada setiap tahapan tersebut, masyarakat memiliki kepentingan untuk memperoleh informasi dan, sesuai mekanisme yang berlaku, menyampaikan masukan.
                </p>
              </div>

              {/* MODULE 2: 4-STAGE PUBLIC POLICY CYCLE STEPPER */}
              <div className="rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                    PETA INTERAKTIF • SIKLUS KEBIJAKAN PUBLIK
                  </span>
                  <h3 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink mt-1">
                    Di Mana Masyarakat Dapat Masuk &amp; Menyampaikan Masukan?
                  </h3>
                  <p className="font-sans text-xs text-paper-muted dark:text-night-muted mt-1">
                    Klik setiap tahapan di bawah untuk melihat bagaimana kebijakan disusun dan ruang keterlibatan warga.
                  </p>
                </div>

                {/* 4 Stepper Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {policyStepsData.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPolicyStep(idx)}
                      className={`text-left p-3.5 rounded-xl transition-all cursor-pointer ${
                        selectedPolicyStep === idx
                          ? 'border-2 border-crimson bg-paper-light dark:bg-night-bg'
                          : 'border border-paper-border dark:border-night-border bg-paper-light/60 dark:bg-night-bg/60 hover:border-crimson/50'
                      }`}
                    >
                      <span className={`font-mono text-[10px] font-bold uppercase block ${selectedPolicyStep === idx ? 'text-crimson dark:text-crimson-bright' : 'text-paper-muted'}`}>
                        Tahap 0{idx + 1}
                      </span>
                      <span className="font-sans font-bold text-xs sm:text-sm text-paper-ink dark:text-night-ink mt-0.5 block">
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Content Box */}
                <div className="p-5 sm:p-6 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-pop-in">
                  <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-paper-border dark:border-night-border pb-4 md:pb-0 md:pr-6">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                      {policyStepsData[selectedPolicyStep].num}
                    </span>
                    <h4 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink">
                      {policyStepsData[selectedPolicyStep].title}
                    </h4>
                    <p className="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">
                      {policyStepsData[selectedPolicyStep].desc}
                    </p>
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-navy dark:text-blue-400 font-bold">
                      Kepentingan &amp; Peran Masyarakat:
                    </span>
                    <p className="font-serif text-base text-paper-ink dark:text-night-ink leading-relaxed">
                      {policyStepsData[selectedPolicyStep].citizenRole}
                    </p>
                  </div>
                </div>

              </div>

            </section>

            {/* ==========================================
                 SECTION 05: LANDASAN HUKUM
                 ========================================== */}
            <section id="section-landasan-hukum" className="scroll-mt-28 space-y-8">
              <div className="economist-rubric-bar">
                <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                  JAMINAN KONSTITUSIONAL &amp; UNDANG-UNDANG
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-paper-ink dark:text-night-ink mt-1 leading-tight">
                  Suara Masyarakat Memiliki Landasan Hukum
                </h2>
              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Partisipasi publik bukan sekadar ajakan moral. Di Indonesia, hak masyarakat untuk terlibat dalam pembentukan peraturan memiliki landasan melalui <strong>Pasal 96 Undang-Undang Nomor 13 Tahun 2022</strong>. Ketentuan tersebut memberikan hak kepada masyarakat untuk menyampaikan masukan secara lisan maupun tertulis dalam setiap tahapan pembentukan peraturan perundang-undangan, baik secara daring maupun luring.
                </p>
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Selain itu, <strong>Mahkamah Konstitusi melalui Putusan Nomor 91/PUU-XVIII/2020</strong> menegaskan prinsip <strong className="text-crimson dark:text-crimson-bright">meaningful participation</strong> atau partisipasi yang bermakna. Prinsip ini mencakup tiga hak utama:
                </p>
              </div>

              {/* Legal Cards */}
              <div className="space-y-6">
                
                {/* Pasal 96 */}
                <div className="p-6 rounded-2xl bg-paper-card dark:bg-night-card border-l-4 border-navy dark:border-blue-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs uppercase tracking-widest text-navy dark:text-blue-400 font-bold">
                      UNDANG-UNDANG NOMOR 13 TAHUN 2022 • PASAL 96
                    </span>
                    <h3 className="font-display font-bold text-xl text-paper-ink dark:text-night-ink">
                      Hak Masukan di Setiap Tahapan Pembentukan Peraturan
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-paper-muted dark:text-night-muted">
                      Menjamin hak masyarakat menyampaikan masukan secara <strong>lisan maupun tertulis</strong>, baik secara <strong>daring (online) maupun luring (tatap muka)</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 font-mono text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border font-semibold">Lisan &amp; Tertulis</span>
                    <span className="px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border font-semibold">Daring &amp; Luring</span>
                  </div>
                </div>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Pillar 1 */}
                  <div className="group rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-crimson p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-crimson/10 text-crimson dark:bg-crimson-bright/20 dark:text-crimson-bright">
                          PILAR 01
                        </span>
                        <span className="font-mono text-[11px] text-paper-muted dark:text-night-muted">Putusan MK 91/2020</span>
                      </div>
                      <h4 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink group-hover:text-crimson dark:group-hover:text-crimson-bright transition-colors">
                        Right to be heard
                      </h4>
                      <p className="font-serif italic text-base text-paper-ink dark:text-night-ink">
                        “Hak masyarakat untuk didengar pendapatnya.”
                      </p>
                      <p className="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">
                        Pemerintah dan pembentuk undang-undang wajib membuka ruang serta kanal resmi agar masyarakat dapat menyampaikan aspirasi tanpa hambatan.
                      </p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-paper-border dark:border-night-border font-mono text-[11px] text-crimson dark:text-crimson-bright font-semibold">
                      Tahap Buka Ruang Aspirasi →
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="group rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-crimson p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-crimson/10 text-crimson dark:bg-crimson-bright/20 dark:text-crimson-bright">
                          PILAR 02
                        </span>
                        <span className="font-mono text-[11px] text-paper-muted dark:text-night-muted">Putusan MK 91/2020</span>
                      </div>
                      <h4 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink group-hover:text-crimson dark:group-hover:text-crimson-bright transition-colors">
                        Right to be considered
                      </h4>
                      <p className="font-serif italic text-base text-paper-ink dark:text-night-ink">
                        “Hak agar pendapatnya dipertimbangkan.”
                      </p>
                      <p className="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">
                        Setiap masukan warga tidak boleh sekadar dicatat sebagai daftar hadir, melainkan wajib ditimbang secara substansial dalam pengambilan keputusan.
                      </p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-paper-border dark:border-night-border font-mono text-[11px] text-crimson dark:text-crimson-bright font-semibold">
                      Tahap Penimbangan Substansi →
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="group rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border hover:border-crimson p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-crimson/10 text-crimson dark:bg-crimson-bright/20 dark:text-crimson-bright">
                          PILAR 03
                        </span>
                        <span className="font-mono text-[11px] text-paper-muted dark:text-night-muted">Putusan MK 91/2020</span>
                      </div>
                      <h4 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink group-hover:text-crimson dark:group-hover:text-crimson-bright transition-colors">
                        Right to be explained
                      </h4>
                      <p className="font-serif italic text-base text-paper-ink dark:text-night-ink">
                        “Hak memperoleh penjelasan atau jawaban atas pendapat yang disampaikan.”
                      </p>
                      <p className="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">
                        Pemerintah perlu memberikan penjelasan mengenai bagaimana masukan masyarakat tersebut ditanggapi dalam rumusan kebijakan akhir.
                      </p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-paper-border dark:border-night-border font-mono text-[11px] text-crimson dark:text-crimson-bright font-semibold">
                      Tahap Akuntabilitas Jawaban →
                    </div>
                  </div>

                </div>

              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Ketiga prinsip ini menegaskan bahwa partisipasi masyarakat tidak seharusnya hanya menjadi formalitas. Pemerintah perlu membuka ruang bagi masyarakat untuk menyampaikan aspirasi dan memberikan penjelasan mengenai bagaimana masukan tersebut ditanggapi.
                </p>
              </div>

            </section>

            {/* ==========================================
                 SECTION 06: MAHASISWA BUKAN PENONTON
                 ========================================== */}
            <section id="section-mahasiswa" className="scroll-mt-28 space-y-8">
              <div className="economist-rubric-bar">
                <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                  AGEN PERUBAHAN &amp; LANGKAH NYATA
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-paper-ink dark:text-night-ink mt-1 leading-tight">
                  Mahasiswa Bukan Sekadar Penonton
                </h2>
              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Lantas, bagaimana mahasiswa dapat mengambil bagian? Partisipasi tidak harus selalu diwujudkan melalui demonstrasi atau keterlibatan dalam politik praktis. Langkah sederhana pun dapat memberikan kontribusi.
                </p>
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Mulailah dengan membiasakan diri membaca informasi dari sumber resmi, memeriksa fakta sebelum membagikan berita, dan memahami dampak suatu kebijakan sebelum memberikan penilaian. Mahasiswa juga dapat mengikuti diskusi atau konsultasi publik, menyampaikan aspirasi kepada lembaga yang berwenang, serta melakukan kajian sederhana untuk mengawasi pelaksanaan kebijakan.
                </p>
              </div>

              {/* MODULE 3: CIVIC ACTION CHECKLIST */}
              <div className="rounded-2xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-night-border pb-5">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                      REFLEKSI INTERAKTIF • 6 LANGKAH PARTISIPASI
                    </span>
                    <h3 className="font-display font-bold text-2xl text-paper-ink dark:text-night-ink mt-1">
                      Seberapa Bermakna Partisipasimu Saat Ini?
                    </h3>
                    <p className="font-sans text-xs text-paper-muted dark:text-night-muted mt-1">
                      Centang kebiasaan kewarganegaraan di bawah ini yang sudah mulai kamu lakukan.
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono font-bold text-2xl text-crimson dark:text-crimson-bright">{checkedCount} / 6</span>
                    <span className="block font-mono text-[10px] uppercase text-paper-muted dark:text-night-muted">Kebiasaan Aktif</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-paper-elevated dark:bg-night-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-crimson dark:bg-crimson-bright transition-all duration-300" style={{ width: `${checklistPct}%` }}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { title: 'Membaca Informasi dari Sumber Resmi', desc: 'Merujuk langsung pada naskah regulasi atau dokumen lembaga resmi.' },
                    { title: 'Memeriksa Fakta Sebelum Membagikan Berita', desc: 'Mencegah disinformasi dengan memverifikasi kebenaran isu publik.' },
                    { title: 'Memahami Dampak Kebijakan Sebelum Menilai', desc: 'Mempelajari implikasi kebijakan terhadap masyarakat luas secara objektif.' },
                    { title: 'Mengikuti Diskusi atau Konsultasi Publik', desc: 'Hadir dan terlibat dalam forum pembahasan kebijakan publik.' },
                    { title: 'Menyampaikan Aspirasi ke Lembaga Berwenang', desc: 'Menggunakan kanal daring maupun luring sesuai Pasal 96 UU 13/2022.' },
                    { title: 'Melakukan Kajian Sederhana Pengawasan', desc: 'Mengawasi dan mengevaluasi pelaksanaan kebijakan di lapangan.' }
                  ].map((item, idx) => (
                    <label 
                      key={idx}
                      onClick={() => handleToggleChecklist(idx)}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all select-none cursor-pointer ${
                        checkedItems[idx] 
                          ? 'border-crimson bg-crimson/5 dark:bg-crimson/10 shadow-xs' 
                          : 'border-paper-border dark:border-night-border bg-paper-light dark:bg-night-bg hover:border-crimson/50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={checkedItems[idx]} 
                        onChange={() => {}} 
                        className="mt-1 w-4 h-4 accent-crimson rounded cursor-pointer" 
                      />
                      <div>
                        <span className="font-sans font-bold text-sm text-paper-ink dark:text-night-ink block">{item.title}</span>
                        <span className="font-sans text-xs text-paper-muted dark:text-night-muted mt-0.5 block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-paper-elevated/70 dark:bg-night-elevated/70 font-sans text-xs text-paper-ink dark:text-night-ink">
                  {checkedCount === 0 && 'Mulai centang langkah-langkah di atas untuk melihat profil partisipasi kewarganegaraanmu.'}
                  {checkedCount > 0 && checkedCount <= 2 && (
                    <span><strong className="text-amber-600 dark:text-amber-400">Langkah Awal Literasi Publik:</strong> Kamu sudah memulai kebiasaan baik dengan membangun literasi informasi. Teruskan dengan memahami dampak kebijakan dan mulai mengikuti diskusi publik.</span>
                  )}
                  {checkedCount > 2 && checkedCount <= 4 && (
                    <span><strong className="text-navy dark:text-blue-400">Warga Kampus yang Kritis & Peduli:</strong> Kamu tidak sekadar menjadi penonton. Kamu telah menjembatani kesenjangan antara mengetahui konsep dan memahami proses kebijakan.</span>
                  )}
                  {checkedCount > 4 && (
                    <span><strong className="text-emerald-600 dark:text-emerald-400">Penggerak Partisipasi Bermakna (Meaningful Participation):</strong> Luar biasa! Kamu mempraktikkan literasi informasi, berdialog di ruang konsultasi publik, dan mengawal perubahan secara aktif.</span>
                  )}
                </div>

              </div>

              <div className="article-prose">
                <p className="font-serif text-paper-ink dark:text-night-ink">
                  Pada akhirnya, semangat kebangsaan tidak hanya ditunjukkan melalui rasa bangga terhadap negara atau kegiatan seremonial. Semangat tersebut juga tercermin dari kepedulian terhadap persoalan bangsa dan kesediaan untuk memperjuangkan kepentingan bersama.
                </p>
              </div>

              {/* Monumental Closing Editorial Pull-Quote */}
              <figure className="my-12 p-8 sm:p-12 rounded-2xl bg-paper-ink dark:bg-night-card text-paper-light dark:text-night-ink border border-paper-border dark:border-night-border relative overflow-hidden shadow-lg">
                <div className="w-16 h-1 bg-crimson mb-6"></div>
                <blockquote className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-snug tracking-tight">
                  “Mencintai Indonesia bukan berarti harus selalu menyetujui setiap keputusan pemerintah. Terkadang, bentuk kepedulian terbesar justru hadir melalui keberanian untuk bertanya, mengkritik, dan mengawal perubahan.”
                </blockquote>
                <p className="mt-6 font-serif text-lg sm:text-xl text-paper-border dark:text-night-muted leading-relaxed">
                  Sebab, demokrasi yang kuat tidak dibangun oleh masyarakat yang selalu diam, melainkan oleh masyarakat yang mau memahami, berani bersuara, dan tidak berhenti peduli.
                </p>
              </figure>

            </section>

            {/* ==========================================
                 SECTION 07: REFERENSI
                 ========================================== */}
            <section id="section-referensi" className="scroll-mt-28 pt-10 border-t-2 border-paper-ink dark:border-night-ink space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">
                    DOSSIER AKADEMIK &amp; REGULASI
                  </span>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-paper-ink dark:text-night-ink mt-1">
                    Referensi
                  </h2>
                </div>
                <span className="font-mono text-xs text-paper-muted dark:text-night-muted">
                  Klik "Salin Sitasi" untuk mengutip referensi
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* Ref 1 */}
                <div className="p-5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-crimson text-white">01</span>
                      <span className="font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Jurnal Ilmiah • Administratio (2025)</span>
                    </div>
                    <p className="font-serif text-sm sm:text-base text-paper-ink dark:text-night-ink pt-1">
                      Putri, R. A., Marlina, &amp; Zain, D. (2025). Reimagining Public Policy and Legal Education for Youth Civic Engagement in Indonesia: Bridging Structural Capacity Gaps. <em>Administratio</em>, 16(2), 171–186.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopyCitation(1, 'Putri, R. A., Marlina, & Zain, D. (2025). Reimagining Public Policy and Legal Education for Youth Civic Engagement in Indonesia: Bridging Structural Capacity Gaps. Administratio, 16(2), 171–186.')}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border hover:border-crimson font-mono text-xs font-semibold text-paper-ink dark:text-night-ink transition-all cursor-pointer"
                  >
                    {copiedRefId === 1 ? '✓ Tersalin' : 'Salin Sitasi'}
                  </button>
                </div>

                {/* Ref 2 */}
                <div className="p-5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">02</span>
                      <span className="font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Dokumen Resmi KPU</span>
                    </div>
                    <p className="font-serif text-sm sm:text-base text-paper-ink dark:text-night-ink pt-1">
                      Komisi Pemilihan Umum RI. (2024). Keputusan KPU Nomor 1043 Tahun 2024 tentang Tingkat Partisipasi Pemilih Pemilu 2024.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopyCitation(2, 'Komisi Pemilihan Umum RI. (2024). Keputusan KPU Nomor 1043 Tahun 2024 tentang Tingkat Partisipasi Pemilih Pemilu 2024.')}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border hover:border-crimson font-mono text-xs font-semibold text-paper-ink dark:text-night-ink transition-all cursor-pointer"
                  >
                    {copiedRefId === 2 ? '✓ Tersalin' : 'Salin Sitasi'}
                  </button>
                </div>

                {/* Ref 3 */}
                <div className="p-5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">03</span>
                      <span className="font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Dokumen Resmi Undang-Undang</span>
                    </div>
                    <p className="font-serif text-sm sm:text-base text-paper-ink dark:text-night-ink pt-1">
                      Republik Indonesia. (2022). Undang-Undang Nomor 13 Tahun 2022 tentang Pembentukan Peraturan Perundang-Undangan.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopyCitation(3, 'Republik Indonesia. (2022). Undang-Undang Nomor 13 Tahun 2022 tentang Pembentukan Peraturan Perundang-Undangan.')}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border hover:border-crimson font-mono text-xs font-semibold text-paper-ink dark:text-night-ink transition-all cursor-pointer"
                  >
                    {copiedRefId === 3 ? '✓ Tersalin' : 'Salin Sitasi'}
                  </button>
                </div>

                {/* Ref 4 */}
                <div className="p-5 rounded-xl bg-paper-card dark:bg-night-card border border-paper-border dark:border-night-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-white">04</span>
                      <span className="font-mono text-xs uppercase text-paper-muted dark:text-night-muted">Dokumen Putusan Mahkamah Konstitusi</span>
                    </div>
                    <p className="font-serif text-sm sm:text-base text-paper-ink dark:text-night-ink pt-1">
                      Mahkamah Konstitusi RI. (2021). Putusan Nomor 91/PUU-XVIII/2020.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCopyCitation(4, 'Mahkamah Konstitusi RI. (2021). Putusan Nomor 91/PUU-XVIII/2020.')}
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border hover:border-crimson font-mono text-xs font-semibold text-paper-ink dark:text-night-ink transition-all cursor-pointer"
                  >
                    {copiedRefId === 4 ? '✓ Tersalin' : 'Salin Sitasi'}
                  </button>
                </div>

              </div>
            </section>

          </article>
        </div>
      </main>

      {/* EDITORIAL FOOTER */}
      <footer className="border-t border-paper-border dark:border-night-border bg-paper-card dark:bg-night-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-5 bg-crimson inline-block rounded-xs"></span>
              <span className="font-display font-black tracking-tight text-base uppercase text-paper-ink dark:text-night-ink">
                Jurnal Warga • Publikasi Editorial Interaktif
              </span>
            </div>
            <p className="font-sans text-xs text-paper-muted dark:text-night-muted">
              Dirancang untuk literasi kebijakan publik, pendidikan hukum, dan partisipasi bermakna.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('kuis')}
              className="btn-3d btn-3d-indigo px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Tantang Kuis Civic Quest →</span>
            </button>
            <a 
              href="#hero" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border font-mono text-xs text-paper-ink dark:text-night-ink hover:border-crimson transition-all"
            >
              <span>Kembali ke Atas</span>
              <span>↑</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
