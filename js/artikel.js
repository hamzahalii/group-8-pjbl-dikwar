    // =========================================================
    // 1. DYNAMIC READING TIME & SCROLL PROGRESS BAR
    // =========================================================
    function initReadingMetrics() {
      const articleEl = document.getElementById('articleBody');
      if (articleEl) {
        const text = articleEl.innerText || '';
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.max(3, Math.ceil(wordCount / 190));
        document.getElementById('readingTimeDisplay').textContent = `~${minutes} mnt baca`;
      }

      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        document.getElementById('readingProgressBar').style.width = `${progress}%`;
        updateActiveTocOnScroll();
      });
    }

    // =========================================================
    // 2. FONT SIZE CONTROLLER (A- / 100% / A+)
    // =========================================================
    let currentFontScale = 0; // -2 to +3
    const baseRem = 1.1875; // 19px

    function adjustFontSize(direction) {
      if (direction === 0) {
        currentFontScale = 0;
      } else {
        currentFontScale = Math.max(-2, Math.min(3, currentFontScale + direction));
      }
      const newSize = (baseRem + currentFontScale * 0.09).toFixed(3);
      document.documentElement.style.setProperty('--body-font-size', `${newSize}rem`);
      const pct = Math.round((newSize / baseRem) * 100);
      document.getElementById('fontResetBtn').textContent = `${pct}%`;
    }

    // =========================================================
    // 3. DARK / LIGHT EDITORIAL MODE TOGGLE
    // =========================================================
    function toggleEditorialTheme() {
      const htmlEl = document.documentElement;
      const isDark = htmlEl.classList.toggle('dark');
      const sunIcon = document.getElementById('sunIcon');
      const moonIcon = document.getElementById('moonIcon');
      const themeText = document.getElementById('themeToggleText');

      if (isDark) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        themeText.textContent = 'Mode Kertas';
      } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        themeText.textContent = 'Mode Malam';
      }
    }

    // =========================================================
    // 4. MOBILE TOC DRAWER & SCROLLSPY
    // =========================================================
    function toggleMobileTOC() {
      const drawer = document.getElementById('mobileTocDrawer');
      drawer.classList.toggle('hidden');
    }

    const sectionTitles = {
      'section-pengantar': '01 • Ketika Suara Dianggap Tak Berarti',
      'section-kritik-vs-apatis': '02 • Kritik Bukanlah Apatisme',
      'section-data-pemuda': '03 • Kesenjangan Partisipasi Pemuda',
      'section-bilik-suara': '04 • Demokrasi Tak Berhenti di Bilik Suara',
      'section-landasan-hukum': '05 • Landasan Hukum & Putusan MK',
      'section-mahasiswa': '06 • Mahasiswa Bukan Sekadar Penonton',
      'section-referensi': '07 • Referensi & Dokumen Hukum'
    };

    function updateActiveTocOnScroll() {
      const sections = Object.keys(sectionTitles);
      let currentSection = sections[0];

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            currentSection = id;
          }
        }
      }

      // Update Top Masthead Active Label
      const labelEl = document.getElementById('activeSectionLabel');
      if (labelEl) {
        labelEl.textContent = sectionTitles[currentSection];
      }

      // Update Desktop Sidebar TOC highlight
      document.querySelectorAll('.toc-link').forEach(link => {
        const target = link.getAttribute('data-toc');
        if (target === currentSection) {
          link.className = 'toc-link flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-crimson dark:text-crimson-bright font-bold bg-paper-elevated/70 dark:bg-night-elevated/70 transition-all';
        } else {
          link.className = 'toc-link flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-paper-muted dark:text-night-muted hover:text-paper-ink dark:hover:text-night-ink transition-all';
        }
      });
    }

    // =========================================================
    // 5. HERO SVG INTERACTIVE ILLUSTRATION CAPTIONS
    // =========================================================
    function highlightHeroCaption(key) {
      const captionEl = document.getElementById('heroSvgCaptionText');
      const messages = {
        suara: '<strong class="text-crimson dark:text-crimson-bright">Suara & Kritik Warga:</strong> Menyampaikan kritik, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas merupakan bagian sah dari demokrasi, bukan apatisme.',
        mengenal: '<strong class="text-navy dark:text-blue-400">96,3% Mengenal Konsep:</strong> Dari 567 pemuda Indonesia usia 16–30 tahun yang diteliti (Putri dkk., 2025), hampir seluruhnya mengenal konsep partisipasi kebijakan publik.',
        memahami: '<strong class="text-paper-ink dark:text-night-ink">43,7% Memahami Proses:</strong> Kurang dari separuh responden yang memahami alur dan mekanisme bagaimana sebuah kebijakan publik dapat dipengaruhi.',
        terlibat: '<strong class="text-crimson dark:text-crimson-bright">19,2% Keterlibatan Langsung:</strong> Hanya sekitar 1 dari 5 pemuda dalam survei yang pernah terlibat langsung dalam proses kebijakan publik.'
      };
      if (messages[key]) {
        captionEl.innerHTML = messages[key];
      }
    }

    // =========================================================
    // 6. MODULE 1: KRITIK VS APATISME COMPARISON & QUIZ
    // =========================================================
    function switchComparisonMode(mode) {
      const cardKritis = document.getElementById('cardKritis');
      const cardApatis = document.getElementById('cardApatis');
      const grid = document.getElementById('comparisonGrid');

      ['all', 'kritis', 'apatis'].forEach(m => {
        const btn = document.getElementById(`compBtn-${m}`);
        if (m === mode) {
          btn.className = 'px-3 py-1.5 rounded-lg font-sans text-xs font-bold bg-crimson text-white transition-all';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-sans text-xs font-semibold text-paper-muted dark:text-night-muted hover:text-paper-ink transition-all';
        }
      });

      if (mode === 'all') {
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6 mt-6';
        cardKritis.classList.remove('hidden');
        cardApatis.classList.remove('hidden');
      } else if (mode === 'kritis') {
        grid.className = 'grid grid-cols-1 gap-6 mt-6';
        cardKritis.classList.remove('hidden');
        cardApatis.classList.add('hidden');
      } else {
        grid.className = 'grid grid-cols-1 gap-6 mt-6';
        cardKritis.classList.add('hidden');
        cardApatis.classList.remove('hidden');
      }
    }

    function evaluateScenario(caseNum) {
      const box = document.getElementById('scenarioFeedback');
      box.classList.remove('hidden');
      if (caseNum === 1) {
        box.innerHTML = '<strong class="text-crimson dark:text-crimson-bright">Analisis Kasus A — Gejala Apatisme Politik:</strong> Merasa tidak setuju terhadap kebijakan tetapi memilih untuk mengabaikannya karena merasa suaranya tidak akan didengar adalah bentuk melemahnya <em>political efficacy</em> yang berujung pada apatisme.';
      } else {
        box.innerHTML = '<strong class="text-emerald-600 dark:text-emerald-400">Analisis Kasus B — Partisipasi Demokratis (Bukan Apatisme):</strong> Mengkritik pemerintah, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas justru merupakan wujud kepedulian dan bagian penting dari kehidupan demokrasi.';
      }
    }

    // =========================================================
    // 7. MODULE 2: DATA VISUALIZATION (PUTRI, MARLINA, & ZAIN 2025)
    // =========================================================
    function selectDataStage(stage) {
      const stages = ['mengetahui', 'memahami', 'melakukan'];
      stages.forEach(s => {
        const el = document.getElementById(`stageRow-${s}`);
        if (s === stage) {
          el.className = 'cursor-pointer p-4 rounded-xl bg-paper-light dark:bg-night-bg border-2 border-crimson transition-all';
        } else {
          el.className = 'cursor-pointer p-4 rounded-xl bg-paper-light dark:bg-night-bg border border-paper-border dark:border-night-border hover:border-crimson/60 transition-all';
        }
      });

      const detailBox = document.getElementById('dataStageDetail');
      if (stage === 'mengetahui') {
        detailBox.innerHTML = '<strong class="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 1 (96,3% — Mengenal Konsep):</strong> Dari 567 pemuda berusia 16–30 tahun, hampir semuanya mengenal konsep partisipasi kebijakan publik. Hal ini membuktikan bahwa persoalan utamanya bukan karena generasi muda tidak mengenal politik.';
      } else if (stage === 'memahami') {
        detailBox.innerHTML = '<strong class="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 2 (43,7% — Memahami Proses):</strong> Terjadi penurunan tajam. Seseorang mungkin mengetahui bahwa masyarakat berhak menyampaikan aspirasi, tetapi belum tentu memahami kepada siapa aspirasi harus disampaikan atau bagaimana proses kebijakan dapat dipengaruhi.';
      } else {
        detailBox.innerHTML = '<strong class="text-crimson dark:text-crimson-bright font-mono uppercase text-xs block mb-1">Analisis Tahap 3 (19,2% — Keterlibatan Langsung):</strong> Hanya 19,2% responden yang tercatat pernah terlibat langsung. Selain kendala pemahaman prosedur, rendahnya keterlibatan langsung juga dipengaruhi oleh rasa tidak percaya atau rendahnya <em>political efficacy</em>.';
      }
    }

    function toggleMethodModal() {
      const box = document.getElementById('methodNoteBox');
      box.classList.toggle('hidden');
    }

    // =========================================================
    // 8. MODULE 3: 4-STAGE PUBLIC POLICY CYCLE STEPPER
    // =========================================================
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

    function selectPolicyStep(idx) {
      for (let i = 0; i < 4; i++) {
        const tab = document.getElementById(`policyTab-${i}`);
        if (i === idx) {
          tab.className = 'policy-tab text-left p-3.5 rounded-xl border-2 border-crimson bg-paper-light dark:bg-night-bg transition-all';
        } else {
          tab.className = 'policy-tab text-left p-3.5 rounded-xl border border-paper-border dark:border-night-border bg-paper-light/60 dark:bg-night-bg/60 hover:border-crimson/50 transition-all';
        }
      }

      const data = policyStepsData[idx];
      const container = document.getElementById('policyStepContent');
      container.innerHTML = `
        <div class="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-paper-border dark:border-night-border pb-4 md:pb-0 md:pr-6">
          <span class="font-mono text-[11px] uppercase tracking-widest text-crimson dark:text-crimson-bright font-bold">${data.num}</span>
          <h4 class="font-display font-bold text-2xl text-paper-ink dark:text-night-ink">${data.title}</h4>
          <p class="font-sans text-xs text-paper-muted dark:text-night-muted leading-relaxed">${data.desc}</p>
        </div>
        <div class="md:col-span-7 space-y-2">
          <span class="font-mono text-[11px] uppercase tracking-widest text-navy dark:text-blue-400 font-bold">Kepentingan &amp; Peran Masyarakat:</span>
          <p class="font-serif text-base text-paper-ink dark:text-night-ink leading-relaxed">${data.citizenRole}</p>
        </div>
      `;
    }

    // =========================================================
    // 9. MODULE 4: CIVIC ACTION CHECKLIST
    // =========================================================
    function updateCivicChecklist() {
      const checks = document.querySelectorAll('.civic-check');
      let checkedCount = 0;
      checks.forEach(c => { if (c.checked) checkedCount++; });

      const total = checks.length;
      const pct = Math.round((checkedCount / total) * 100);

      document.getElementById('checklistScoreLabel').textContent = `${checkedCount} / ${total}`;
      document.getElementById('checklistProgressBar').style.width = `${pct}%`;

      const feedbackEl = document.getElementById('checklistFeedbackBox');
      if (checkedCount === 0) {
        feedbackEl.innerHTML = 'Mulai centang langkah-langkah di atas untuk melihat profil partisipasi kewarganegaraanmu.';
      } else if (checkedCount <= 2) {
        feedbackEl.innerHTML = '<strong class="text-amber-600 dark:text-amber-400">Langkah Awal Literasi Publik:</strong> Kamu sudah memulai kebiasaan baik dengan membangun literasi informasi. Teruskan dengan memahami dampak kebijakan dan mulai mengikuti diskusi publik.';
      } else if (checkedCount <= 4) {
        feedbackEl.innerHTML = '<strong class="text-navy dark:text-blue-400">Warga Kampus yang Kritis & Peduli:</strong> Kamu tidak sekadar menjadi penonton. Kamu telah menjembatani kesenjangan antara mengetahui konsep dan memahami proses kebijakan.';
      } else {
        feedbackEl.innerHTML = '<strong class="text-emerald-600 dark:text-emerald-400">Penggerak Partisipasi Bermakna (Meaningful Participation):</strong> Luar biasa! Kamu mempraktikkan literasi informasi, berdialog di ruang konsultasi publik, dan mengawal perubahan secara aktif.';
      }
    }

    // =========================================================
    // 10. COPY CITATION TO CLIPBOARD (IFRAME-SAFE)
    // =========================================================
    function copyCitation(num) {
      const textEl = document.getElementById(`refText-${num}`);
      const btnEl = document.getElementById(`copyBtn-${num}`);
      if (!textEl || !btnEl) return;

      const tempInput = document.createElement('textarea');
      tempInput.value = textEl.innerText.trim();
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      const originalText = btnEl.textContent;
      btnEl.textContent = '✓ Tersalin';
      btnEl.classList.add('bg-crimson', 'text-white', 'border-crimson');
      setTimeout(() => {
        btnEl.textContent = originalText;
        btnEl.classList.remove('bg-crimson', 'text-white', 'border-crimson');
      }, 2000);
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      initReadingMetrics();
      selectPolicyStep(0);
    });
