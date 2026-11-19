    (function () {
      "use strict";

      // =========================================================================
      // 0. KONFIGURASI DATABASE GOOGLE SHEETS & PIN MODERATOR
      // =========================================================================
      // Tempelkan URL Web App Google Apps Script Anda (https://script.google.com/macros/s/.../exec)
      // di bawah ini sebelum membagikan file index.html ke mahasiswa:
      const DEFAULT_GOOGLE_SHEETS_WEBAPP_URL = "";
      const MODERATOR_PIN_CODE = "kel8juara";
      const STORAGE_KEY_SUBMISSIONS = "civic_quest_submissions_v3";
      const STORAGE_KEY_SHEETS_URL = "civic_quest_gsheets_url_v3";

      let runtimeGoogleSheetsUrl = (
        localStorage.getItem(STORAGE_KEY_SHEETS_URL) ||
        DEFAULT_GOOGLE_SHEETS_WEBAPP_URL ||
        ""
      ).trim();

      // =========================================================================
      // 1. EXACT QUIZ CONTENT DATABASE (BAGIAN A: SOAL 1-8 & BAGIAN B: SOAL 9-10)
      // =========================================================================
      const BAGIAN_A_QUESTIONS = [
        {
          id: 1,
          category: "Kritik vs. Apatisme",
          scenario: "Seorang mahasiswa membaca kebijakan pemerintah mengenai kenaikan biaya pendidikan. Ia mempelajari alasan kebijakan tersebut, membandingkan dampaknya, kemudian menyampaikan kritik berdasarkan data melalui forum aspirasi publik.",
          question: "Berdasarkan konsep dalam artikel, bagaimana tindakan mahasiswa tersebut dikategorikan?",
          options: [
            { letter: "A", text: "Apatisme politik karena menolak kebijakan pemerintah." },
            { letter: "B", text: "Sikap anti-demokrasi karena tidak menyetujui keputusan pemerintah." },
            { letter: "C", text: "Bentuk partisipasi demokrasi karena menyampaikan kritik berdasarkan alasan yang jelas." },
            { letter: "D", text: "Ketidakpedulian politik karena tidak mengikuti keputusan pemerintah." }
          ],
          correctLetter: "C",
          hint: "Artikel meluruskan bahwa mengkritik pemerintah dengan alasan dan argumen yang jelas bukanlah bentuk apatisme, melainkan bagian vital dari kehidupan demokrasi.",
          explanation: "Dalam artikel ditegaskan bahwa mengkritik pemerintah bukanlah bentuk apatisme. Justru menyampaikan kritik, mempertanyakan keputusan, dan menolak kebijakan dengan alasan yang jelas merupakan bagian dari kehidupan demokrasi."
        },
        {
          id: 2,
          category: "Riset Pemuda 2025",
          scenario: "Penelitian Putri, Marlina, dan Zain (2025) terhadap 567 pemuda Indonesia menemukan bahwa 96,3% responden mengenal konsep partisipasi kebijakan publik, 43,7% memahami prosesnya, dan 19,2% terlibat secara langsung.",
          question: "Kesimpulan yang paling tepat berdasarkan temuan tersebut adalah ...",
          options: [
            { letter: "A", text: "Sebagian besar pemuda Indonesia tidak memiliki ketertarikan terhadap politik." },
            { letter: "B", text: "Mengenal konsep partisipasi belum tentu berarti memahami proses dan terlibat secara langsung." },
            { letter: "C", text: "Seluruh pemuda Indonesia memiliki tingkat partisipasi politik yang rendah." },
            { letter: "D", text: "Rendahnya keterlibatan langsung membuktikan bahwa generasi muda tidak peduli terhadap negara." }
          ],
          correctLetter: "B",
          hint: "Perhatikan penurunan persentase dari 96,3% (mengenal konsep) menjadi 43,7% (memahami proses) dan 19,2% (terlibat langsung).",
          explanation: "Temuan riset Putri, Marlina, dan Zain (2025) menunjukkan adanya kesenjangan antara mengetahui (96,3%), memahami prosesnya (43,7%), dan melakukan tindakan partisipasi langsung (19,2%)."
        },
        {
          id: 3,
          category: "Demokrasi Pasca-Pemilu",
          scenario: "Setelah pemilihan umum selesai, sekelompok mahasiswa beranggapan bahwa tanggung jawab mereka sebagai warga negara telah terpenuhi karena sudah menggunakan hak pilih. Namun, beberapa bulan kemudian, pemerintah menerapkan kebijakan baru yang berdampak terhadap biaya pendidikan mahasiswa.",
          question: "Berdasarkan pemahaman mengenai partisipasi demokrasi dalam artikel, tindakan yang paling tepat dilakukan mahasiswa adalah ...",
          options: [
            { letter: "A", text: "Menunggu pemilihan umum berikutnya karena pengawasan pemerintah merupakan tanggung jawab lembaga negara." },
            { letter: "B", text: "Menerima kebijakan tersebut karena pemimpin yang membuat keputusan telah dipilih melalui proses demokrasi." },
            { letter: "C", text: "Mempelajari kebijakan tersebut, mengidentifikasi dampaknya, menyampaikan aspirasi, serta mengawasi pelaksanaannya." },
            { letter: "D", text: "Menolak kebijakan tersebut tanpa perlu memahami alasan dan tujuan pembentukannya." }
          ],
          correctLetter: "C",
          hint: "Demokrasi tidak berhenti di bilik suara; setelah pemimpin terpilih, warga tetap bertanggung jawab mengawasi kebijakan.",
          explanation: "Demokrasi tidak berhenti di bilik suara. Setelah pemimpin terpilih, masyarakat tetap memiliki tanggung jawab untuk mempelajari kebijakan, mengidentifikasi dampaknya, menyampaikan masukan, dan mengawasi pelaksanaannya."
        },
        {
          id: 4,
          category: "Political Efficacy",
          scenario: "Dalam kajian politik, terdapat konsep political efficacy atau efikasi politik. Konsep ini berkaitan dengan keyakinan seseorang bahwa dirinya mampu memahami dan berpartisipasi dalam politik serta suaranya berpotensi membawa pengaruh.",
          question: "Situasi manakah yang paling menggambarkan konsep tersebut?",
          options: [
            { letter: "A", text: "Seseorang menghindari seluruh informasi mengenai kebijakan karena menganggap politik tidak penting." },
            { letter: "B", text: "Seseorang hanya mengikuti keputusan pemerintah tanpa mempertanyakan dampaknya." },
            { letter: "C", text: "Seseorang menyampaikan pendapat tanpa berusaha memahami persoalan yang dibahas." },
            { letter: "D", text: "Seseorang yakin bahwa ia mampu memahami persoalan publik dan aspirasinya berpotensi memengaruhi keputusan." }
          ],
          correctLetter: "D",
          hint: "Efikasi politik mencakup dua dimensi keyakinan: mampu memahami persoalan politik dan yakin suaranya membawa pengaruh.",
          explanation: "Political efficacy (efikasi politik) adalah keyakinan warga negara bahwa dirinya mampu memahami dan berpartisipasi dalam politik serta percaya bahwa suaranya berpotensi membawa pengaruh."
        },
        {
          id: 5,
          category: "Siklus Kebijakan Publik",
          scenario: "Pemerintah daerah menerima banyak keluhan masyarakat mengenai buruknya fasilitas transportasi umum. Setelah mengidentifikasi persoalan tersebut, pemerintah mulai mengkaji penyebabnya, mengumpulkan data, dan membandingkan beberapa alternatif solusi sebelum menetapkan keputusan.",
          question: "Berdasarkan tahapan kebijakan publik dalam artikel, kegiatan yang sedang dilakukan pemerintah tersebut termasuk tahap ...",
          options: [
            { letter: "A", text: "Identifikasi masalah, karena pemerintah baru mengetahui adanya persoalan di masyarakat." },
            { letter: "B", text: "Perumusan alternatif penyelesaian, karena pemerintah sedang mengkaji penyebab dan membandingkan berbagai pilihan solusi." },
            { letter: "C", text: "Pengambilan keputusan, karena pemerintah telah menetapkan kebijakan yang akan diterapkan." },
            { letter: "D", text: "Pelaksanaan dan evaluasi, karena pemerintah sedang mengukur keberhasilan kebijakan yang sudah berjalan." }
          ],
          correctLetter: "B",
          hint: "Dalam skenario disebutkan pemerintah sudah selesai mengidentifikasi persoalan dan kini sedang membandingkan berbagai pilihan solusi.",
          explanation: "Urutan siklus kebijakan dalam artikel adalah: (1) Identifikasi masalah, (2) Perumusan alternatif penyelesaian, (3) Pengambilan keputusan, dan (4) Pelaksanaan dan evaluasi."
        },
        {
          id: 6,
          category: "Pasal 96 UU No. 13/2022",
          scenario: "Pemerintah daerah sedang menyusun rancangan peraturan mengenai pengelolaan lingkungan. Sekelompok mahasiswa ingin memberikan masukan terhadap rancangan tersebut.",
          question: "Berdasarkan Pasal 96 Undang-Undang Nomor 13 Tahun 2022, tindakan yang sesuai dengan hak masyarakat adalah ...",
          options: [
            { letter: "A", text: "Masyarakat hanya boleh memberikan pendapat setelah peraturan disahkan." },
            { letter: "B", text: "Masukan hanya dapat disampaikan secara langsung melalui demonstrasi." },
            { letter: "C", text: "Masyarakat berhak menyampaikan masukan secara lisan maupun tertulis dalam setiap tahapan pembentukan peraturan, baik daring maupun luring." },
            { letter: "D", text: "Hanya kelompok masyarakat yang memiliki jabatan pemerintahan yang dapat memberikan masukan." }
          ],
          correctLetter: "C",
          hint: "Pasal 96 UU No. 13 Tahun 2022 membuka saluran partisipasi yang luas di setiap tahapan pembentukan peraturan.",
          explanation: "Pasal 96 Undang-Undang Nomor 13 Tahun 2022 memberikan hak kepada masyarakat untuk menyampaikan masukan secara lisan maupun tertulis dalam setiap tahapan pembentukan peraturan perundang-undangan, baik secara daring maupun luring."
        },
        {
          id: 7,
          category: "Meaningful Participation",
          scenario: "Dalam prinsip meaningful participation yang dijelaskan dalam artikel, terdapat tiga hak utama masyarakat.",
          question: "Manakah pasangan konsep dan penjelasan yang benar?",
          options: [
            { letter: "A", text: "Right to be heard = hak didengar; Right to be considered = hak dipertimbangkan; Right to be explained = hak memperoleh penjelasan." },
            { letter: "B", text: "Right to be heard = hak mengambil keputusan; Right to be considered = hak menyetujui kebijakan; Right to be explained = hak menolak pemerintah." },
            { letter: "C", text: "Right to be heard = hak memperoleh informasi; Right to be considered = hak memilih pejabat; Right to be explained = hak membuat peraturan." },
            { letter: "D", text: "Right to be heard = hak menyampaikan kritik; Right to be considered = hak membatalkan kebijakan; Right to be explained = hak menentukan hasil pemilu." }
          ],
          correctLetter: "A",
          hint: "Ingat terjemahan harfiah ketiganya: heard (didengar), considered (dipertimbangkan), explained (dijelaskan).",
          explanation: "Berdasarkan Putusan MK Nomor 91/PUU-XVIII/2020, prinsip meaningful participation mencakup tiga hak utama: Right to be heard (hak didengar), Right to be considered (hak dipertimbangkan), dan Right to be explained (hak memperoleh penjelasan)."
        },
        {
          id: 8,
          category: "Peran Strategis Mahasiswa",
          scenario: "Sebuah kebijakan pemerintah telah diterapkan, tetapi mahasiswa menemukan bahwa pelaksanaannya tidak sesuai dengan tujuan awal dan menimbulkan dampak yang merugikan masyarakat.",
          question: "Berdasarkan peran mahasiswa dalam artikel, tindakan yang paling tepat adalah ...",
          options: [
            { letter: "A", text: "Mengabaikan persoalan karena kebijakan sudah ditetapkan pemerintah." },
            { letter: "B", text: "Menyebarkan informasi mengenai kebijakan tanpa memeriksa kebenarannya." },
            { letter: "C", text: "Menganggap bahwa pengawasan merupakan tanggung jawab pemerintah sepenuhnya." },
            { letter: "D", text: "Mengumpulkan informasi yang dapat dipercaya, melakukan kajian terhadap dampak kebijakan, kemudian menyampaikan aspirasi kepada lembaga yang berwenang." }
          ],
          correctLetter: "D",
          hint: "Artikel menekankan pentingnya verifikasi fakta, kajian sederhana, dan penyaluran aspirasi ke lembaga berwenang.",
          explanation: "Mahasiswa berperan aktif dengan membiasakan diri membaca sumber resmi, memeriksa fakta, melakukan kajian sederhana untuk mengawasi pelaksanaan kebijakan, serta menyampaikan aspirasi kepada lembaga yang berwenang."
        }
      ];

      const BAGIAN_B_ESSAYS = [
        {
          id: 9,
          category: "ANALISIS KASUS",
          title: "9. ANALISIS KASUS",
          promptText: "Bayangkan pemerintah daerah akan menerapkan kebijakan baru mengenai biaya transportasi umum. Kebijakan tersebut berpotensi memengaruhi pengeluaran mahasiswa. Namun, sebagian besar mahasiswa tidak mengetahui proses pembuatannya dan merasa bahwa pendapat mereka tidak akan didengarkan.",
          subLabel1: "Menurut kamu: Mengapa kondisi tersebut dapat mendorong munculnya apatisme politik?",
          subLabel2: "Apa dua tindakan konkret yang dapat dilakukan mahasiswa untuk berpartisipasi dalam persoalan tersebut?",
          placeholder1: "Jelaskan keterkaitan antara ketidaktahuan prosedur kebijakan, hilangnya kepercayaan (political efficacy), dan munculnya sikap apatis...",
          placeholder2: "Tuliskan 2 tindakan konkret mahasiswa (misalnya: membaca dokumen resmi & kajian dampak, lalu menyampaikan aspirasi via konsultasi publik sesuai Pasal 96 UU 13/2022)...",
          chips: [
            { label: "Political Efficacy Rendah", snippet: "Ketika mahasiswa merasa pendapatnya tidak akan dipertimbangkan, efikasi politik (political efficacy) melemah sehingga memicu apatisme." },
            { label: "Kesenjangan Pemahaman Proses", snippet: "Ketidaktahuan alur dan prosedur pembuatan kebijakan membuat mahasiswa bingung ke mana harus menyalurkan aspirasi." },
            { label: "Kajian Data & Sumber Resmi", snippet: "1) Mengumpulkan informasi dari dokumen resmi dan menyusun kajian sederhana mengenai dampak tarif transportasi bagi mahasiswa." },
            { label: "Pasal 96 UU 13/2022", snippet: "2) Menyampaikan masukan tertulis maupun lisan melalui forum konsultasi publik kepada pemda/DPRD sesuai hak dalam Pasal 96 UU No. 13 Tahun 2022." }
          ],
          keywords: ["efikasi", "efficacy", "percaya", "proses", "paham", "kajian", "data", "resmi", "aspirasi", "konsultasi", "pasal 96", "dengar", "heard", "transportasi"],
          benchmarkHtml: "<p><strong>1. Mengapa mendorong apatisme politik:</strong> Kondisi tersebut memadukan dua penghambat utama dalam artikel: <em>keterbatasan literasi prosedural</em> (mahasiswa tidak memahami alur dan pintu masuk pembuatan kebijakan) serta melemahnya <em>political efficacy</em> (hilangnya keyakinan bahwa suara mereka akan didengar atau dipertimbangkan), sehingga mereka memilih pasif dan tidak peduli.</p><p><strong>2. Dua tindakan konkret mahasiswa:</strong> (a) Membaca dokumen kebijakan dari sumber resmi serta menyusun kajian dampak sederhana mengenai beban pengeluaran mahasiswa; (b) Mengikuti forum diskusi/konsultasi publik dan menyampaikan masukan tertulis/lisan kepada lembaga berwenang sesuai jaminan <strong>Pasal 96 UU Nomor 13 Tahun 2022</strong> dan prinsip <em>meaningful participation</em>.</p>"
        },
        {
          id: 10,
          category: "REFLEKSI DAN PROYEKSI AKSI",
          title: "10. REFLEKSI DAN PROYEKSI AKSI",
          promptText: "Setelah membaca artikel, menurut kamu, apa satu bentuk apatisme politik yang paling perlu diperhatikan di lingkungan mahasiswa saat ini?\nBayangkan kamu diberi kesempatan untuk membuat satu aksi edukasi sederhana di kampus guna meningkatkan kepedulian dan partisipasi demokrasi mahasiswa.",
          subLabel1: "1. Apa satu bentuk apatisme politik yang paling perlu diperhatikan di lingkungan mahasiswa saat ini?",
          subLabel2: "2. Jelaskan aksi edukasi sederhana yang akan kamu lakukan di kampus, alasan memilih aksi tersebut, serta perubahan apa yang kamu harapkan terjadi setelah aksi dilaksanakan.",
          placeholder1: "Uraikan fenomena apatisme yang sering kamu temui di kampus (misalnya: enggan mengikuti isu kebijakan publik pasca-pemilu, mudah menyebar berita tanpa cek fakta, atau merasa suara mahasiswa tidak berdampak)...",
          placeholder2: "Jelaskan nama & bentuk aksi edukasi kampusmu, alasan strategis memilihnya, serta dampak perubahan yang diharapkan...",
          chips: [
            { label: "Apatisme Pasca-Pemilu", snippet: "Anggapan bahwa kewajiban demokrasi selesai setelah pemilu sehingga mahasiswa abai mengawasi kebijakan publik sehari-hari." },
            { label: "Klinik Literasi Kebijakan", snippet: "Mengadakan 'Pojok Bedah Kebijakan & Klinik Aspirasi Kampus' untuk membedah isu aktual berbasis sumber resmi." },
            { label: "Menjembatani Gap 96,3% vs 43,7%", snippet: "Alasan: menjembatani kesenjangan pemuda yang kenal konsep (96,3%) namun belum paham cara berpartisipasi (43,7%)." },
            { label: "Dampak Perubahan Nyata", snippet: "Perubahan yang diharapkan: meningkatnya efikasi politik mahasiswa agar kritis berbasis data dan berani mengawal kebijakan." }
          ],
          keywords: ["kampus", "mahasiswa", "edukasi", "diskusi", "kajian", "literasi", "fakta", "kebijakan", "kritis", "efikasi", "perubahan", "peduli", "aspirasi", "demokrasi"],
          benchmarkHtml: "<p><strong>1. Bentuk apatisme yang perlu diperhatikan:</strong> Sikap pasif yang menganggap demokrasi berhenti setelah pemilu, disertai kebiasaan mengabaikan berita kebijakan publik atau berkomentar tanpa memverifikasi fakta dari sumber resmi.</p><p><strong>2. Rancangan Aksi Edukasi Kampus, Alasan &amp; Harapan:</strong> Membuat forum <em>“Klinik Literasi Kebijakan &amp; Simulasi Penyusunan Masukan Publik”</em> di kampus. <strong>Alasan:</strong> Riset Putri dkk. (2025) menunjukkan 96,3% pemuda mengenal konsep partisipasi, tetapi hanya 43,7% yang memahami prosesnya. <strong>Perubahan yang diharapkan:</strong> Mahasiswa memahami jalur penyampaian aspirasi yang sah (lisan/tertulis), terbiasa memeriksa fakta sebelum berbagi informasi, dan memiliki keberanian kritis untuk mengawal kepentingan bersama.</p>"
        }
      ];

      // =========================================================================
      // 2. CENTRALIZED APPLICATION STATE
      // =========================================================================
      const state = {
        screen: "start",
        playerName: "",
        playerClass: "",
        mcIndex: 0,
        mcSelectedLetter: null,
        mcLocked: false,
        mcEliminatedLetters: [],
        mcHintShown: false,
        mcAnswers: [],
        essayIndex: 0,
        essayLocked: false,
        essayAnswers: {
          9: { part1: "", part2: "", earnedXp: 0, rubricCount: 0 },
          10: { part1: "", part2: "", earnedXp: 0, rubricCount: 0 }
        },
        xp: 0,
        streak: 0,
        maxStreak: 0,
        lifelines: {
          fiftyFifty: 2,
          hint: 2
        },
        soundEnabled: true,
        currentSubmissionId: "",
        submissions: [],
        inspectedDocId: null,
        previousScreenBeforeMod: "start"
      };

      // =========================================================================
      // 3. SAFE LOCALSTORAGE PERSISTENCE FOR SUBMISSIONS
      // =========================================================================
      function loadSubmissionsFromStorage() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          console.error("Failed reading localStorage:", err);
          return [];
        }
      }

      function saveSubmissionsToStorage(list) {
        try {
          localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
        } catch (err) {
          console.error("Failed writing localStorage:", err);
        }
      }

      state.submissions = loadSubmissionsFromStorage();

      // =========================================================================
      // 4. WEB AUDIO API SYNTHESIZER (SAFE & NON-BLOCKING)
      // =========================================================================
      let audioCtx = null;

      function playSound(type) {
        if (!state.soundEnabled) return;
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          if (!audioCtx) {
            audioCtx = new AudioContextClass();
          }
          if (audioCtx.state === "suspended") {
            audioCtx.resume();
          }

          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);

          if (type === "click") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
          } else if (type === "correct") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.09);
            osc.frequency.setValueAtTime(783.99, now + 0.18);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
            osc.start(now);
            osc.stop(now + 0.36);
          } else if (type === "wrong") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(155, now + 0.25);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.start(now);
            osc.stop(now + 0.28);
          } else if (type === "powerup") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
            gain.gain.setValueAtTime(0.11, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
          } else if (type === "victory") {
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach(function (freq, idx) {
              const o = audioCtx.createOscillator();
              const g = audioCtx.createGain();
              o.type = "triangle";
              o.connect(g);
              g.connect(audioCtx.destination);
              o.frequency.setValueAtTime(freq, now + idx * 0.1);
              g.gain.setValueAtTime(0.12, now + idx * 0.1);
              g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.32);
              o.start(now + idx * 0.1);
              o.stop(now + idx * 0.1 + 0.32);
            });
          }
        } catch (err) {
          // Audio blocked by browser policy; fail silently
        }
      }

      // =========================================================================
      // 5. NAVIGATION, THEME, AUDIO & MODAL HELPERS
      // =========================================================================
      function showScreen(target) {
        state.screen = target;
        const map = {
          start: "screenStart",
          mc: "screenMultipleChoice",
          transition: "screenTransitionB",
          essay: "screenEssayStudio",
          results: "screenResults",
          moderator: "screenModerator"
        };

        Object.keys(map).forEach(function (key) {
          const el = document.getElementById(map[key]);
          if (el) {
            if (key === target) {
              el.classList.remove("hidden");
            } else {
              el.classList.add("hidden");
            }
          }
        });

        const hudProgress = document.getElementById("hudProgressContainer");
        const mobileProgress = document.getElementById("mobileProgressBarWrapper");
        const isInQuiz = target === "mc" || target === "transition" || target === "essay";

        if (hudProgress) {
          hudProgress.classList.toggle("hidden", !isInQuiz);
        }
        if (mobileProgress) {
          mobileProgress.classList.toggle("hidden", !isInQuiz);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        updateHud();
      }

      function updateHud() {
        const xpEl = document.getElementById("hudXpValue");
        const streakEl = document.getElementById("hudStreakValue");
        const modCountEl = document.getElementById("navModSubCount");

        if (xpEl) xpEl.textContent = String(state.xp);
        if (streakEl) streakEl.textContent = String(state.streak);
        if (modCountEl) modCountEl.textContent = String(state.submissions.length);

        const playerBadge = document.getElementById("hudPlayerBadge");
        const playerIdentity = document.getElementById("hudPlayerIdentity");
        if (playerBadge && playerIdentity) {
          if (state.playerName && state.screen !== "start") {
            playerIdentity.textContent = state.playerName + " • " + state.playerClass;
            playerBadge.classList.remove("hidden");
          } else {
            playerBadge.classList.add("hidden");
          }
        }

        // Progress calculation across 10 questions
        let stepNum = 1;
        let stageLabel = "BAGIAN A";
        if (state.screen === "mc") {
          stepNum = state.mcIndex + 1;
          stageLabel = "BAGIAN A";
        } else if (state.screen === "transition") {
          stepNum = 8;
          stageLabel = "BAGIAN A SELESAI";
        } else if (state.screen === "essay") {
          stepNum = 9 + state.essayIndex;
          stageLabel = "BAGIAN B";
        } else if (state.screen === "results") {
          stepNum = 10;
          stageLabel = "SELESAI";
        }

        const pct = Math.min(100, Math.round((stepNum / 10) * 100));
        const hudBar = document.getElementById("hudProgressBar");
        const hudStep = document.getElementById("hudStepCounter");
        const hudStage = document.getElementById("hudStageBadge");
        const mobBar = document.getElementById("mobileProgressBar");
        const mobStep = document.getElementById("mobileStepCounter");
        const mobStage = document.getElementById("mobileStageLabel");

        if (hudBar) hudBar.style.width = pct + "%";
        if (hudStep) hudStep.textContent = stepNum + "/10";
        if (hudStage) hudStage.textContent = stageLabel;
        if (mobBar) mobBar.style.width = pct + "%";
        if (mobStep) mobStep.textContent = "Soal " + stepNum + " / 10";
        if (mobStage) mobStage.textContent = stageLabel + " — " + (stepNum <= 8 ? "PILIHAN GANDA" : "STUDI KASUS");
      }

      window.toggleTheme = function () {
        playSound("click");
        const htmlEl = document.documentElement;
        const isDark = htmlEl.classList.toggle("dark");
        const sunIcon = document.getElementById("themeSunIcon");
        const moonIcon = document.getElementById("themeMoonIcon");
        if (sunIcon) sunIcon.classList.toggle("hidden", !isDark);
        if (moonIcon) moonIcon.classList.toggle("hidden", isDark);
      };

      window.toggleAudio = function () {
        state.soundEnabled = !state.soundEnabled;
        const onIcon = document.getElementById("soundOnIcon");
        const offIcon = document.getElementById("soundOffIcon");
        if (onIcon) onIcon.classList.toggle("hidden", !state.soundEnabled);
        if (offIcon) offIcon.classList.toggle("hidden", state.soundEnabled);
        if (state.soundEnabled) playSound("click");
      };

      window.toggleReviewModal = function () {
        playSound("click");
        const modal = document.getElementById("articleReferenceModal");
        if (modal) modal.classList.toggle("hidden");
      };

      window.confirmReturnHome = function () {
        playSound("click");
        if (state.screen === "start") return;
        const modal = document.getElementById("resetConfirmModal");
        if (modal) modal.classList.remove("hidden");
      };

      window.closeResetModal = function () {
        playSound("click");
        const modal = document.getElementById("resetConfirmModal");
        if (modal) modal.classList.add("hidden");
      };

      // =========================================================================
      // 6. START QUIZ & ONBOARDING VALIDATION
      // =========================================================================
      function clearOnboardingError() {
        const errBox = document.getElementById("onboardingErrorMsg");
        if (errBox) errBox.classList.add("hidden");
      }

      window.startQuiz = function () {
        const nameInput = document.getElementById("playerNameInput");
        const classInput = document.getElementById("playerCampusInput");
        const errBox = document.getElementById("onboardingErrorMsg");
        const errText = document.getElementById("onboardingErrorText");
        const formCard = document.getElementById("onboardingFormCard");

        const nameVal = nameInput ? nameInput.value.trim() : "";
        const classVal = classInput ? classInput.value.trim() : "";

        if (!nameVal || !classVal) {
          playSound("wrong");
          if (errText) {
            errText.textContent = !nameVal && !classVal
              ? "Mohon isi Nama Lengkap dan Program Studi / Kelas terlebih dahulu."
              : (!nameVal ? "Mohon isi Nama Lengkap kamu terlebih dahulu." : "Mohon isi Program Studi / Kelas (contoh: Matematika/SS18).");
          }
          if (errBox) errBox.classList.remove("hidden");
          if (formCard) {
            formCard.classList.remove("animate-shake");
            void formCard.offsetWidth;
            formCard.classList.add("animate-shake");
          }
          if (!nameVal && nameInput) nameInput.focus();
          else if (classInput) classInput.focus();
          return;
        }

        clearOnboardingError();
        state.playerName = nameVal;
        state.playerClass = classVal;
        state.mcIndex = 0;
        state.mcSelectedLetter = null;
        state.mcLocked = false;
        state.mcEliminatedLetters = [];
        state.mcHintShown = false;
        state.mcAnswers = [];
        state.essayIndex = 0;
        state.essayLocked = false;
        state.essayAnswers = {
          9: { part1: "", part2: "", earnedXp: 0, rubricCount: 0 },
          10: { part1: "", part2: "", earnedXp: 0, rubricCount: 0 }
        };
        state.xp = 0;
        state.streak = 0;
        state.maxStreak = 0;
        state.lifelines = { fiftyFifty: 2, hint: 2 };
        state.currentSubmissionId = "CQ-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

        playSound("powerup");
        showScreen("mc");
        renderMcQuestion();
      };

      // =========================================================================
      // 7. BAGIAN A — MULTIPLE CHOICE ARENA (QUESTIONS 1 TO 8)
      // =========================================================================
      function escapeHtml(str) {
        return String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function renderMcQuestion() {
        const q = BAGIAN_A_QUESTIONS[state.mcIndex];
        if (!q) return;

        state.mcSelectedLetter = null;
        state.mcLocked = false;
        state.mcEliminatedLetters = [];
        state.mcHintShown = false;

        const numBadge = document.getElementById("mcQuestionNumberBadge");
        const catTag = document.getElementById("mcCategoryTag");
        const promptBox = document.getElementById("mcPromptContainer");
        const optionsGrid = document.getElementById("mcOptionsGrid");
        const submitBtn = document.getElementById("btnSubmitMc");
        const feedbackDrawer = document.getElementById("mcFeedbackDrawer");
        const hintBanner = document.getElementById("mcHintBanner");

        if (numBadge) numBadge.textContent = "SOAL " + q.id + " / 8";
        if (catTag) catTag.textContent = q.category;
        if (hintBanner) hintBanner.classList.add("hidden");
        if (feedbackDrawer) feedbackDrawer.classList.add("hidden");
        if (submitBtn) submitBtn.disabled = true;

        updateLifelineButtons();

        if (promptBox) {
          promptBox.innerHTML =
            '<div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-indigo-600 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">' +
              escapeHtml(q.scenario) +
            '</div>' +
            '<h2 class="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">' +
              q.id + ". " + escapeHtml(q.question) +
            '</h2>';
        }

        const badgeColors = {
          A: "bg-indigo-600 text-white",
          B: "bg-cyan-600 text-white",
          C: "bg-amber-500 text-white",
          D: "bg-rose-500 text-white"
        };

        if (optionsGrid) {
          optionsGrid.innerHTML = q.options.map(function (opt) {
            return (
              '<button type="button" id="optCard-' + opt.letter + '" data-option-letter="' + opt.letter + '" onclick="window.selectOption(\'' + opt.letter + '\')" class="option-card-3d w-full p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 flex items-start gap-3.5 text-left">' +
                '<span class="w-9 h-9 rounded-xl ' + badgeColors[opt.letter] + ' font-display font-bold text-base flex items-center justify-center shrink-0 mt-0.5">' +
                  opt.letter +
                '</span>' +
                '<span class="font-sans text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed flex-1">' +
                  escapeHtml(opt.text) +
                '</span>' +
              '</button>'
            );
          }).join("");
        }

        updateHud();
      }

      function updateLifelineButtons() {
        const btn50 = document.getElementById("btnLifeline5050");
        const count50 = document.getElementById("count5050");
        const btnHint = document.getElementById("btnLifelineHint");
        const countHint = document.getElementById("countHint");

        if (count50) count50.textContent = state.lifelines.fiftyFifty + "x";
        if (btn50) {
          btn50.disabled = state.mcLocked || state.lifelines.fiftyFifty <= 0 || state.mcEliminatedLetters.length > 0;
        }

        if (countHint) countHint.textContent = state.lifelines.hint + "x";
        if (btnHint) {
          btnHint.disabled = state.mcLocked || state.lifelines.hint <= 0 || state.mcHintShown;
        }
      }

      window.selectOption = function (letter) {
        if (state.mcLocked) return;
        if (state.mcEliminatedLetters.indexOf(letter) !== -1) return;

        playSound("click");
        state.mcSelectedLetter = letter;

        ["A", "B", "C", "D"].forEach(function (ltr) {
          const card = document.getElementById("optCard-" + ltr);
          if (card) {
            card.classList.toggle("selected-option", ltr === letter);
          }
        });

        const submitBtn = document.getElementById("btnSubmitMc");
        if (submitBtn) submitBtn.disabled = false;
      };

      window.useFiftyFifty = function () {
        if (state.mcLocked || state.lifelines.fiftyFifty <= 0 || state.mcEliminatedLetters.length > 0) return;
        const q = BAGIAN_A_QUESTIONS[state.mcIndex];
        if (!q) return;

        playSound("powerup");
        state.lifelines.fiftyFifty -= 1;

        const wrongLetters = q.options
          .map(function (o) { return o.letter; })
          .filter(function (ltr) { return ltr !== q.correctLetter; });

        // Shuffle wrong letters and pick 2 to eliminate
        for (let i = wrongLetters.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = wrongLetters[i];
          wrongLetters[i] = wrongLetters[j];
          wrongLetters[j] = tmp;
        }

        state.mcEliminatedLetters = wrongLetters.slice(0, 2);

        state.mcEliminatedLetters.forEach(function (ltr) {
          const card = document.getElementById("optCard-" + ltr);
          if (card) {
            card.classList.add("opacity-30", "pointer-events-none", "line-through");
            card.classList.remove("selected-option");
          }
          if (state.mcSelectedLetter === ltr) {
            state.mcSelectedLetter = null;
            const submitBtn = document.getElementById("btnSubmitMc");
            if (submitBtn) submitBtn.disabled = true;
          }
        });

        updateLifelineButtons();
      };

      window.useHint = function () {
        if (state.mcLocked || state.lifelines.hint <= 0 || state.mcHintShown) return;
        const q = BAGIAN_A_QUESTIONS[state.mcIndex];
        if (!q) return;

        playSound("powerup");
        state.lifelines.hint -= 1;
        state.mcHintShown = true;

        const banner = document.getElementById("mcHintBanner");
        const textEl = document.getElementById("mcHintText");
        if (textEl) textEl.textContent = q.hint;
        if (banner) banner.classList.remove("hidden");

        updateLifelineButtons();
      };

      window.checkAnswer = function () {
        if (state.mcLocked || !state.mcSelectedLetter) return;
        const q = BAGIAN_A_QUESTIONS[state.mcIndex];
        if (!q) return;

        state.mcLocked = true;
        updateLifelineButtons();

        const submitBtn = document.getElementById("btnSubmitMc");
        if (submitBtn) submitBtn.disabled = true;

        const isCorrect = state.mcSelectedLetter === q.correctLetter;
        let earnedXp = 0;

        if (isCorrect) {
          state.streak += 1;
          if (state.streak > state.maxStreak) state.maxStreak = state.streak;
          const streakBonus = (state.streak - 1) * 15;
          earnedXp = 100 + streakBonus;
          state.xp += earnedXp;
          playSound("correct");
        } else {
          state.streak = 0;
          playSound("wrong");
        }

        state.mcAnswers[state.mcIndex] = {
          questionId: q.id,
          selectedLetter: state.mcSelectedLetter,
          correctLetter: q.correctLetter,
          isCorrect: isCorrect,
          earnedXp: earnedXp
        };

        // Highlight option cards
        ["A", "B", "C", "D"].forEach(function (ltr) {
          const card = document.getElementById("optCard-" + ltr);
          if (!card) return;
          card.classList.add("locked-option");
          card.classList.remove("selected-option");
          if (ltr === q.correctLetter) {
            card.classList.add("correct-option");
          } else if (ltr === state.mcSelectedLetter && !isCorrect) {
            card.classList.add("wrong-option");
          }
        });

        // Show Feedback Drawer
        const drawer = document.getElementById("mcFeedbackDrawer");
        const iconEl = document.getElementById("mcFeedbackIcon");
        const xpTag = document.getElementById("mcFeedbackXpTag");
        const titleEl = document.getElementById("mcFeedbackTitle");
        const expEl = document.getElementById("mcFeedbackExplanation");
        const nextLabel = document.getElementById("btnNextMcLabel");

        if (drawer) {
          drawer.classList.remove(
            "hidden",
            "bg-emerald-50", "dark:bg-emerald-950/50", "border-emerald-400", "dark:border-emerald-600",
            "bg-rose-50", "dark:bg-rose-950/50", "border-rose-400", "dark:border-rose-600"
          );
          if (isCorrect) {
            drawer.classList.add("bg-emerald-50", "dark:bg-emerald-950/50", "border-emerald-400", "dark:border-emerald-600");
          } else {
            drawer.classList.add("bg-rose-50", "dark:bg-rose-950/50", "border-rose-400", "dark:border-rose-600");
          }
        }

        if (iconEl) {
          iconEl.className = "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 " +
            (isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white");
          iconEl.textContent = isCorrect ? "✓" : "✕";
        }

        if (xpTag) {
          xpTag.className = "font-mono text-xs font-extrabold uppercase tracking-wider block " +
            (isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300");
          xpTag.textContent = isCorrect
            ? ("+" + earnedXp + " XP • STREAK " + state.streak + "x 🔥")
            : ("JAWABAN TEPAT ADALAH OPSI " + q.correctLetter);
        }

        if (titleEl) {
          titleEl.textContent = isCorrect ? "Tepat Sekali! Analisis Tajam." : "Belum Tepat — Mari Pelajari Konsepnya!";
        }

        if (expEl) {
          expEl.textContent = q.explanation;
        }

        if (nextLabel) {
          nextLabel.textContent = state.mcIndex < BAGIAN_A_QUESTIONS.length - 1
            ? "SOAL BERIKUTNYA (" + (state.mcIndex + 2) + "/8)"
            : "SELESAIKAN BAGIAN A";
        }

        updateHud();
        if (drawer) drawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };

      window.nextQuestion = function () {
        playSound("click");
        if (state.screen === "mc") {
          if (state.mcIndex < BAGIAN_A_QUESTIONS.length - 1) {
            state.mcIndex += 1;
            renderMcQuestion();
          } else {
            showTransitionScreen();
          }
        } else if (state.screen === "essay") {
          if (state.essayIndex < BAGIAN_B_ESSAYS.length - 1) {
            state.essayIndex += 1;
            renderEssayQuestion();
          } else {
            finishEntireQuiz();
          }
        }
      };

      function showTransitionScreen() {
        const correctCount = state.mcAnswers.filter(function (a) { return a && a.isCorrect; }).length;
        const pct = Math.round((correctCount / 8) * 100);

        const scoreEl = document.getElementById("transitionMcScoreText");
        const accEl = document.getElementById("transitionAccuracyVal");
        const xpEl = document.getElementById("transitionXpVal");
        const strEl = document.getElementById("transitionStreakVal");

        if (scoreEl) scoreEl.textContent = correctCount + "/8 (" + pct + "%)";
        if (accEl) accEl.textContent = pct + "%";
        if (xpEl) xpEl.textContent = state.xp + " XP";
        if (strEl) strEl.textContent = state.maxStreak + "x 🔥";

        showScreen("transition");
      }

      window.enterBagianB = function () {
        playSound("powerup");
        state.essayIndex = 0;
        showScreen("essay");
        renderEssayQuestion();
      };

      // =========================================================================
      // 8. BAGIAN B — ESSAY STUDIO (QUESTIONS 9 & 10)
      // =========================================================================
      function renderEssayQuestion() {
        const item = BAGIAN_B_ESSAYS[state.essayIndex];
        if (!item) return;

        state.essayLocked = false;

        const numBadge = document.getElementById("essayNumberBadge");
        const catBadge = document.getElementById("essayCategoryBadge");
        const promptBox = document.getElementById("essayPromptBox");
        const chipsBox = document.getElementById("essayConceptChips");
        const label1 = document.getElementById("essaySubLabel1");
        const label2 = document.getElementById("essaySubLabel2");
        const input1 = document.getElementById("essayInput1");
        const input2 = document.getElementById("essayInput2");
        const feedbackCard = document.getElementById("essayFeedbackCard");
        const submitBtn = document.getElementById("btnSubmitEssay");

        if (numBadge) numBadge.textContent = "BAGIAN B • SOAL " + item.id;
        if (catBadge) catBadge.textContent = item.category;
        if (feedbackCard) feedbackCard.classList.add("hidden");
        if (submitBtn) submitBtn.disabled = false;

        if (promptBox) {
          const linesHtml = item.promptText.split("\n").map(function (line) {
            return '<p class="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">' + escapeHtml(line) + '</p>';
          }).join("");
          promptBox.innerHTML =
            '<h2 class="font-display font-bold text-lg sm:text-xl text-indigo-700 dark:text-indigo-300">' + escapeHtml(item.title) + '</h2>' +
            linesHtml;
        }

        if (label1) label1.textContent = item.subLabel1;
        if (label2) label2.textContent = item.subLabel2;

        if (input1) {
          input1.disabled = false;
          input1.placeholder = item.placeholder1;
          input1.value = (state.essayAnswers[item.id] && state.essayAnswers[item.id].part1) || "";
        }
        if (input2) {
          input2.disabled = false;
          input2.placeholder = item.placeholder2;
          input2.value = (state.essayAnswers[item.id] && state.essayAnswers[item.id].part2) || "";
        }

        if (chipsBox) {
          chipsBox.innerHTML = item.chips.map(function (chip, idx) {
            return (
              '<button type="button" data-chip-idx="' + idx + '" onclick="window.insertPromptPill(' + idx + ')" class="btn-3d btn-3d-neutral px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">' +
                '<span>+ ' + escapeHtml(chip.label) + '</span>' +
              '</button>'
            );
          }).join("");
        }

        window.analyzeEssayQuality();
        updateHud();
      }

      window.insertPromptPill = function (chipIdx) {
        if (state.essayLocked) return;
        const item = BAGIAN_B_ESSAYS[state.essayIndex];
        if (!item || !item.chips[chipIdx]) return;

        playSound("click");
        const chip = item.chips[chipIdx];
        const targetInput = chipIdx < 2
          ? document.getElementById("essayInput1")
          : document.getElementById("essayInput2");

        if (targetInput) {
          const cur = targetInput.value.trim();
          targetInput.value = cur ? (cur + " " + chip.snippet) : chip.snippet;
          targetInput.focus();
          window.analyzeEssayQuality();
        }
      };

      window.analyzeEssayQuality = function () {
        const item = BAGIAN_B_ESSAYS[state.essayIndex];
        if (!item) return;

        const input1 = document.getElementById("essayInput1");
        const input2 = document.getElementById("essayInput2");
        const val1 = input1 ? input1.value.trim() : "";
        const val2 = input2 ? input2.value.trim() : "";
        const combined = (val1 + " " + val2).toLowerCase();
        const wordCount = combined.split(/\s+/).filter(Boolean).length;

        const hasDepth = wordCount >= 25;
        const hasConcept = item.keywords.some(function (kw) { return combined.indexOf(kw) !== -1; });
        const hasAction = val2.length >= 25;
        const hasBoth = val1.length >= 12 && val2.length >= 12;

        const checks = {
          depth: hasDepth,
          concept: hasConcept,
          action: hasAction,
          complete: hasBoth
        };

        let passedCount = 0;
        Object.keys(checks).forEach(function (key) {
          const active = checks[key];
          if (active) passedCount += 1;
          const pill = document.getElementById("rubricPill-" + key);
          const icon = document.getElementById("rubricIcon-" + key);
          if (pill) {
            pill.classList.toggle("opacity-50", !active);
            pill.classList.toggle("border-emerald-500", active);
          }
          if (icon && active) {
            icon.className = "w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold";
            icon.textContent = "✓";
          }
        });

        const previewXp = hasBoth ? (100 + passedCount * 35) : 0;
        const previewEl = document.getElementById("essayLiveXpPreview");
        if (previewEl) {
          previewEl.textContent = "+" + previewXp + " XP Terdeteksi (" + wordCount + " kata)";
        }

        return { val1: val1, val2: val2, wordCount: wordCount, passedCount: passedCount, previewXp: previewXp };
      };

      window.submitEssay = function () {
        if (state.essayLocked) return;
        const item = BAGIAN_B_ESSAYS[state.essayIndex];
        if (!item) return;

        const metrics = window.analyzeEssayQuality();
        const msgEl = document.getElementById("essayValidationMsg");

        if (metrics.val1.length < 8 || metrics.val2.length < 8) {
          playSound("wrong");
          if (msgEl) {
            msgEl.className = "font-sans text-xs font-bold text-rose-600 dark:text-rose-400";
            msgEl.textContent = "⚠️ Mohon isi kedua kolom jawaban (poin 1 dan poin 2) sebelum mengunci jawaban.";
          }
          return;
        }

        state.essayLocked = true;
        const earnedXp = Math.max(150, metrics.previewXp);
        state.xp += earnedXp;

        state.essayAnswers[item.id] = {
          part1: metrics.val1,
          part2: metrics.val2,
          earnedXp: earnedXp,
          rubricCount: metrics.passedCount
        };

        const input1 = document.getElementById("essayInput1");
        const input2 = document.getElementById("essayInput2");
        const submitBtn = document.getElementById("btnSubmitEssay");
        const feedbackCard = document.getElementById("essayFeedbackCard");
        const earnedLabel = document.getElementById("essayEarnedXpLabel");
        const benchContent = document.getElementById("essayBenchmarkContent");
        const nextBtnLabel = document.getElementById("btnNextEssayLabel");

        if (input1) input1.disabled = true;
        if (input2) input2.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        if (msgEl) {
          msgEl.className = "font-sans text-xs font-bold text-emerald-600 dark:text-emerald-400";
          msgEl.textContent = "✓ Jawaban terkunci! Bandingkan argumenmu dengan referensi artikel di bawah.";
        }

        if (earnedLabel) earnedLabel.textContent = "+" + earnedXp + " XP • ANALISIS TERSIMPAN";
        if (benchContent) benchContent.innerHTML = item.benchmarkHtml;
        if (nextBtnLabel) {
          nextBtnLabel.textContent = state.essayIndex < BAGIAN_B_ESSAYS.length - 1
            ? "LANJUT KE SOAL 10"
            : "LIHAT SERTIFIKAT & HASIL AKHIR";
        }
        if (feedbackCard) {
          feedbackCard.classList.remove("hidden");
          feedbackCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        playSound("correct");
        updateHud();
      };

      // =========================================================================
      // 9. FINISH QUIZ, CERTIFICATE, PORTFOLIO REVIEW & AUTO-SAVE
      // =========================================================================
      function finishEntireQuiz() {
        playSound("victory");
        launchConfetti();

        const correctMcCount = state.mcAnswers.filter(function (a) { return a && a.isCorrect; }).length;
        const pct = Math.round((correctMcCount / 8) * 100);

        const nameEl = document.getElementById("resultPlayerName");
        const classBadge = document.getElementById("resultPlayerCampusBadge");
        const titleEl = document.getElementById("resultCivicTitle");
        const totalXpEl = document.getElementById("resultTotalXp");
        const accSumEl = document.getElementById("resultAccuracySummary");
        const statMcEl = document.getElementById("statMcScore");
        const statStrEl = document.getElementById("statMaxStreak");
        const statGradeEl = document.getElementById("statCivicGrade");

        if (nameEl) nameEl.textContent = state.playerName;
        if (classBadge) classBadge.textContent = state.playerClass;
        if (totalXpEl) totalXpEl.textContent = state.xp + " XP";
        if (accSumEl) accSumEl.textContent = "Pilihan Ganda: " + correctMcCount + "/8 (" + pct + "%)";
        if (statMcEl) statMcEl.textContent = correctMcCount + " / 8";
        if (statStrEl) statStrEl.textContent = state.maxStreak + "x 🔥";

        let civicTitle = "Predikat: Warga Kampus Peduli Demokrasi";
        let grade = "B+";
        if (correctMcCount >= 7) {
          civicTitle = "Predikat: Arsitek Demokrasi & Pengawal Kebijakan Publik";
          grade = "A+";
        } else if (correctMcCount >= 5) {
          civicTitle = "Predikat: Analis Kebijakan Kritis & Partisipatif";
          grade = "A";
        }
        if (titleEl) titleEl.textContent = civicTitle;
        if (statGradeEl) statGradeEl.textContent = grade;

        renderPortfolioReview();
        showScreen("results");
        saveCurrentRunSubmission(false);
      }

      function renderPortfolioReview() {
        const containerB = document.getElementById("reviewContainerBagianB");
        const containerA = document.getElementById("reviewContainerBagianA");

        if (containerB) {
          containerB.innerHTML = BAGIAN_B_ESSAYS.map(function (item) {
            const ans = state.essayAnswers[item.id] || { part1: "-", part2: "-", earnedXp: 0 };
            return (
              '<div class="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/80 space-y-3">' +
                '<div class="flex items-center justify-between">' +
                  '<span class="font-display font-bold text-base text-emerald-800 dark:text-emerald-300">' + escapeHtml(item.title) + '</span>' +
                  '<span class="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold">+' + ans.earnedXp + ' XP</span>' +
                '</div>' +
                '<div class="space-y-2 text-xs sm:text-sm">' +
                  '<div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
                    '<span class="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">' + escapeHtml(item.subLabel1) + '</span>' +
                    '<p class="text-slate-800 dark:text-slate-100 whitespace-pre-line">' + escapeHtml(ans.part1 || "-") + '</p>' +
                  '</div>' +
                  '<div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">' +
                    '<span class="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">' + escapeHtml(item.subLabel2) + '</span>' +
                    '<p class="text-slate-800 dark:text-slate-100 whitespace-pre-line">' + escapeHtml(ans.part2 || "-") + '</p>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join("");
        }

        if (containerA) {
          containerA.innerHTML = BAGIAN_A_QUESTIONS.map(function (q, idx) {
            const rec = state.mcAnswers[idx] || { selectedLetter: "-", isCorrect: false, earnedXp: 0 };
            const chosenOpt = q.options.find(function (o) { return o.letter === rec.selectedLetter; });
            const correctOpt = q.options.find(function (o) { return o.letter === q.correctLetter; });
            return (
              '<div class="p-4 rounded-2xl border-2 ' + (rec.isCorrect ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20') + ' space-y-2">' +
                '<div class="flex items-center justify-between gap-2">' +
                  '<span class="font-display font-bold text-sm text-slate-900 dark:text-white">Soal ' + q.id + ' • ' + escapeHtml(q.category) + '</span>' +
                  '<span class="px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold ' + (rec.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') + '">' +
                    (rec.isCorrect ? ('Benar (+' + rec.earnedXp + ' XP)') : 'Kurang Tepat') +
                  '</span>' +
                '</div>' +
                '<p class="text-xs text-slate-600 dark:text-slate-300">' + escapeHtml(q.question) + '</p>' +
                '<div class="text-xs space-y-1 pt-1">' +
                  '<p class="font-semibold text-slate-800 dark:text-slate-100">Jawabanmu: <span class="font-mono font-bold">' + rec.selectedLetter + '.</span> ' + escapeHtml(chosenOpt ? chosenOpt.text : "-") + '</p>' +
                  (!rec.isCorrect
                    ? '<p class="font-semibold text-emerald-700 dark:text-emerald-400">Kunci Jawaban: <span class="font-mono font-bold">' + q.correctLetter + '.</span> ' + escapeHtml(correctOpt ? correctOpt.text : "-") + '</p>'
                    : '') +
                '</div>' +
              '</div>'
            );
          }).join("");
        }
      }

      window.switchReviewTab = function (tab) {
        playSound("click");
        const bA = document.getElementById("reviewContainerBagianA");
        const bB = document.getElementById("reviewContainerBagianB");
        if (bA) bA.classList.toggle("hidden", tab === "bagianB");
        if (bB) bB.classList.toggle("hidden", tab === "bagianA");

        ["all", "bagianA", "bagianB"].forEach(function (t) {
          const btn = document.getElementById("revTab-" + t);
          if (!btn) return;
          if (t === tab) {
            btn.className = "px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold bg-indigo-600 text-white transition-all cursor-pointer";
          } else {
            btn.className = "px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-all cursor-pointer";
          }
        });
      };

      window.copyResultReport = function () {
        playSound("click");
        const correctCount = state.mcAnswers.filter(function (a) { return a && a.isCorrect; }).length;
        const pct = Math.round((correctCount / 8) * 100);
        const e9 = state.essayAnswers[9] || { part1: "-", part2: "-" };
        const e10 = state.essayAnswers[10] || { part1: "-", part2: "-" };

        const lines = [
          "==========================================",
          "LAPORAN HASIL KUIS: CIVIC QUEST",
          "Topik: Apatisme Publik & Demokrasi",
          "==========================================",
          "Nama Lengkap          : " + state.playerName,
          "Program Studi / Kelas : " + state.playerClass,
          "Skor Bagian A (PG)    : " + correctCount + "/8 (" + pct + "%)",
          "Total XP              : " + state.xp + " XP",
          "------------------------------------------",
          "BAGIAN A — PILIHAN GANDA (1–8)",
          "------------------------------------------"
        ];

        BAGIAN_A_QUESTIONS.forEach(function (q, idx) {
          const rec = state.mcAnswers[idx] || { selectedLetter: "-", isCorrect: false };
          lines.push("Soal " + q.id + ": Jawaban " + rec.selectedLetter + " (" + (rec.isCorrect ? "Benar" : "Salah, Kunci: " + q.correctLetter) + ")");
        });

        lines.push(
          "------------------------------------------",
          "BAGIAN B — ISIAN & STUDI KASUS (9–10)",
          "------------------------------------------",
          "[Soal 9.1 - Mengapa mendorong apatisme politik?]",
          e9.part1 || "-",
          "",
          "[Soal 9.2 - Dua tindakan konkret mahasiswa]",
          e9.part2 || "-",
          "",
          "[Soal 10.1 - Bentuk apatisme di lingkungan mahasiswa]",
          e10.part1 || "-",
          "",
          "[Soal 10.2 - Aksi edukasi kampus, alasan & harapan]",
          e10.part2 || "-",
          "=========================================="
        );

        copyTextToClipboard(lines.join("\n"));
        const btn = document.getElementById("btnCopyFullReport");
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = "<span>✅ Laporan Jawaban Berhasil Disalin!</span>";
          setTimeout(function () { btn.innerHTML = orig; }, 2500);
        }
      };

      window.restartQuiz = function () {
        playSound("click");
        const modal = document.getElementById("resetConfirmModal");
        if (modal) modal.classList.add("hidden");
        state.xp = 0;
        state.streak = 0;
        showScreen("start");
      };

      function copyTextToClipboard(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      // =========================================================================
      // 10. SUBMISSION PAYLOAD & GOOGLE SHEETS 2-WAY DATABASE SYNC
      // =========================================================================
      function buildCurrentSubmissionObject() {
        const correctMcCount = state.mcAnswers.filter(function (a) { return a && a.isCorrect; }).length;
        const pct = Math.round((correctMcCount / 8) * 100);
        const now = new Date();
        const wib = now.toLocaleString("id-ID", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit"
        });

        const detailedMcq = BAGIAN_A_QUESTIONS.map(function (q, idx) {
          const rec = state.mcAnswers[idx] || { selectedLetter: "-", isCorrect: false, earnedXp: 0 };
          const opt = q.options.find(function (o) { return o.letter === rec.selectedLetter; });
          return {
            questionId: q.id,
            selectedOption: rec.selectedLetter,
            selectedText: opt ? opt.text : "-",
            correctOption: q.correctLetter,
            isCorrect: Boolean(rec.isCorrect),
            earnedXp: rec.earnedXp || 0
          };
        });

        const e9 = state.essayAnswers[9] || { part1: "", part2: "", earnedXp: 0 };
        const e10 = state.essayAnswers[10] || { part1: "", part2: "", earnedXp: 0 };

        return {
          id: state.currentSubmissionId || ("CQ-" + now.getTime()),
          docId: state.currentSubmissionId || ("CQ-" + now.getTime()),
          studentName: state.playerName || "Mahasiswa",
          studentClass: state.playerClass || "Matematika/SS18",
          mcqScore: correctMcCount,
          mcqPercentage: pct,
          xp: state.xp,
          baseXp: state.xp,
          maxStreak: state.maxStreak,
          mcqAnswers: detailedMcq,
          essay9: {
            part1_mengapa_apatis: e9.part1 || "",
            part2_dua_tindakan: e9.part2 || "",
            earnedXp: e9.earnedXp || 0,
            moderatorScore: 0,
            moderatorComment: ""
          },
          essay10: {
            part1_bentuk_apatisme: e10.part1 || "",
            part2_aksi_dan_alasan: e10.part2 || "",
            earnedXp: e10.earnedXp || 0,
            moderatorScore: 0,
            moderatorComment: ""
          },
          moderatorReviewed: false,
          submittedAt: now.toISOString(),
          submittedAtMs: now.getTime(),
          submittedAtWIB: wib
        };
      }

      async function saveCurrentRunSubmission(isManualRetry) {
        const sub = buildCurrentSubmissionObject();
        const idx = state.submissions.findIndex(function (s) { return (s.id || s.docId) === sub.id; });
        if (idx !== -1) {
          state.submissions[idx] = sub;
        } else {
          state.submissions.unshift(sub);
        }
        saveSubmissionsToStorage(state.submissions);
        updateHud();

        const titleEl = document.getElementById("cloudSyncTitle");
        const subEl = document.getElementById("cloudSyncSubtitle");
        const spinEl = document.getElementById("cloudSyncSpinner");

        if (runtimeGoogleSheetsUrl) {
          if (titleEl) titleEl.textContent = "Mengirim Jawaban ke Google Sheets...";
          if (spinEl) spinEl.textContent = "⏳";
          const ok = await postSubmissionToGoogleSheets(sub, "submitQuiz");
          if (ok) {
            if (titleEl) titleEl.textContent = "✅ Tersimpan ke Database & Google Sheets ✓";
            if (subEl) subEl.textContent = "Jawaban " + sub.studentName + " (" + sub.studentClass + ") terekam di Google Sheets Moderator.";
          } else {
            if (titleEl) titleEl.textContent = "Tersimpan di Rekap Lokal (Periksa URL Google Sheets)";
            if (subEl) subEl.textContent = "Data tersimpan aman di perangkat ini.";
          }
        } else {
          if (titleEl) titleEl.textContent = "Tersimpan Otomatis di Rekap Moderator ✓";
          if (subEl) subEl.textContent = "Data atas nama " + sub.studentName + " (" + sub.studentClass + ") telah terekam.";
        }
        if (spinEl) spinEl.textContent = "✓";
        if (isManualRetry) playSound("powerup");
      }

      window.manualResyncSubmission = function () {
        saveCurrentRunSubmission(true);
      };

      function buildGoogleSheetsPayload(sub, actionType) {
        const e9 = sub.essay9 || {};
        const e10 = sub.essay10 || {};
        const mod9 = Number(e9.moderatorScore || 0);
        const mod10 = Number(e10.moderatorScore || 0);
        const baseXp = Number(sub.baseXp !== undefined ? sub.baseXp : (sub.xp || 0));
        const totalXp = baseXp + mod9 + mod10;

        const mcMap = {};
        BAGIAN_A_QUESTIONS.forEach(function (q, i) {
          const rec = (Array.isArray(sub.mcqAnswers) && sub.mcqAnswers[i])
            ? sub.mcqAnswers[i]
            : { selectedOption: "-", isCorrect: false };
          mcMap["Q" + q.id] = rec.selectedOption + " (" + (rec.isCorrect ? "Benar" : "Salah") + ")";
        });

        return {
          action: actionType || "submitQuiz",
          id: sub.id || sub.docId,
          timestamp: sub.submittedAtWIB || sub.submittedAt,
          name: sub.studentName,
          prodi: sub.studentClass,
          mcScore: (sub.mcqScore || 0) + "/8 (" + (sub.mcqPercentage || 0) + "%)",
          xp: totalXp,
          mcAnswers: mcMap,
          essay9: "[Mengapa Apatis]: " + (e9.part1_mengapa_apatis || "-") + " | [2 Tindakan]: " + (e9.part2_dua_tindakan || "-"),
          essay10: "[Bentuk Apatisme]: " + (e10.part1_bentuk_apatisme || "-") + " | [Aksi & Harapan]: " + (e10.part2_aksi_dan_alasan || "-"),
          modScore9: mod9,
          modComment9: e9.moderatorComment || "",
          modScore10: mod10,
          modComment10: e10.moderatorComment || "",
          gradedByMod: Boolean(sub.moderatorReviewed || mod9 > 0 || mod10 > 0 || e9.moderatorComment || e10.moderatorComment),
          rawSubmission: sub
        };
      }

      async function postSubmissionToGoogleSheets(sub, actionType) {
        if (!runtimeGoogleSheetsUrl) return false;
        const payload = buildGoogleSheetsPayload(sub, actionType);
        try {
          await fetch(runtimeGoogleSheetsUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          });
          updateSheetsStatusBadge("ok", "🟢 Google Sheets Terkirim");
          return true;
        } catch (err) {
          console.error("Sheets POST error:", err);
          updateSheetsStatusBadge("error", "⚠️ Gagal Kirim ke Sheets");
          return false;
        }
      }

      function updateSheetsStatusBadge(status, label) {
        const badge = document.getElementById("gsheetsConnectionBadge");
        if (!badge) return;
        if (status === "syncing") {
          badge.className = "px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold";
          badge.textContent = label || "⏳ Menyinkronkan...";
        } else if (status === "error") {
          badge.className = "px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold";
          badge.textContent = label || "⚠️ Gagal Terhubung";
        } else if (runtimeGoogleSheetsUrl && runtimeGoogleSheetsUrl.indexOf("https://script.google.com/") === 0) {
          badge.className = "px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold";
          badge.textContent = label || "🟢 Google Sheets Aktif";
        } else {
          badge.className = "px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold";
          badge.textContent = "⚪ URL Belum Diatur";
        }
      }

      window.saveGoogleSheetsUrl = function () {
        const input = document.getElementById("gsheetsWebAppUrlInput");
        const logText = document.getElementById("gsheetsSyncLogText");
        if (!input) return;
        const val = input.value.trim();

        if (val && val.indexOf("https://script.google.com/") !== 0) {
          playSound("wrong");
          updateSheetsStatusBadge("error", "⚠️ Format URL Salah");
          if (logText) logText.textContent = "⚠️ URL harus diawali https://script.google.com/macros/s/.../exec";
          return;
        }

        runtimeGoogleSheetsUrl = val;
        try {
          localStorage.setItem(STORAGE_KEY_SHEETS_URL, val);
        } catch (e) {}

        playSound("powerup");
        updateSheetsStatusBadge();

        if (val) {
          if (logText) logText.textContent = "✅ URL Google Sheets tersimpan! Menarik data terbaru...";
          window.testAndSyncSheets();
        } else {
          if (logText) logText.textContent = "ℹ️ URL Google Sheets dikosongkan.";
        }
      };

      window.testAndSyncSheets = async function () {
        const logText = document.getElementById("gsheetsSyncLogText");
        const timeEl = document.getElementById("gsheetsLastSyncTime");

        if (!runtimeGoogleSheetsUrl) {
          playSound("wrong");
          if (logText) logText.textContent = "⚠️ Tempelkan URL Web App Google Apps Script terlebih dahulu.";
          return;
        }

        try {
          updateSheetsStatusBadge("syncing", "⏳ Menarik Data Sheets...");
          if (logText) logText.textContent = "⏳ Menghubungi Google Sheets untuk menarik seluruh jawaban mahasiswa...";

          const sep = runtimeGoogleSheetsUrl.indexOf("?") !== -1 ? "&" : "?";
          const res = await fetch(runtimeGoogleSheetsUrl + sep + "action=getAll&t=" + Date.now(), {
            method: "GET",
            redirect: "follow"
          });
          const data = await res.json();

          if (data && Array.isArray(data.submissions)) {
            const mapById = {};
            state.submissions.forEach(function (s) {
              const key = s.id || s.docId;
              if (key) mapById[key] = s;
            });
            data.submissions.forEach(function (s) {
              if (!s) return;
              const key = s.id || s.docId || ("GS-" + Math.random().toString(36).substring(2, 8));
              s.id = key;
              s.docId = key;
              mapById[key] = s;
            });

            state.submissions = Object.keys(mapById).map(function (k) { return mapById[k]; });
            saveSubmissionsToStorage(state.submissions);
            window.renderModeratorDashboard();
            updateHud();

            updateSheetsStatusBadge("ok", "🟢 Terhubung (" + data.submissions.length + " Baris Sheets)");
            if (logText) logText.textContent = "✅ Berhasil menarik & menyinkronkan " + data.submissions.length + " data mahasiswa dari Google Sheets.";
            if (timeEl) timeEl.textContent = "Sinkron: " + new Date().toLocaleTimeString("id-ID");
            playSound("powerup");
          } else {
            throw new Error("Invalid JSON response");
          }
        } catch (err) {
          console.error("Sheets GET error:", err);
          updateSheetsStatusBadge("error", "⚠️ Gagal Tarik Data");
          if (logText) {
            logText.textContent = "⚠️ Tidak dapat menarik data dari Google Sheets. Pastikan Web App di-deploy dengan akses 'Siapa saja (Anyone)'.";
          }
        }
      };

      function getAppsScriptCodeText() {
        return [
          "// ============================================================================",
          "// GOOGLE APPS SCRIPT (Code.gs) — DATABASE 2 ARAH CIVIC QUEST",
          "// Deploy as Web App -> Execute as: Me -> Who has access: Anyone (Siapa saja)",
          "// ============================================================================",
          "const SHEET_NAME = 'Jawaban_Mahasiswa';",
          "const HEADERS = [",
          "  'ID', 'Waktu Submit', 'Nama Lengkap', 'Program Studi / Kelas',",
          "  'Skor PG (Benar/8)', 'Total XP',",
          "  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8',",
          "  'Esai 9 (Analisis Kasus)', 'Esai 10 (Refleksi & Aksi)',",
          "  'Bonus XP Esai 9', 'Komentar Moderator Esai 9',",
          "  'Bonus XP Esai 10', 'Komentar Moderator Esai 10',",
          "  'Status Dinilai', 'Raw JSON'",
          "];",
          "",
          "function getOrCreateSheet() {",
          "  const ss = SpreadsheetApp.getActiveSpreadsheet();",
          "  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];",
          "  if (sheet.getLastRow() === 0) {",
          "    sheet.appendRow(HEADERS);",
          "    sheet.getRange(1, 1, 1, HEADERS.length).setBackground('#312E81').setFontColor('#FFFFFF').setFontWeight('bold');",
          "    sheet.setFrozenRows(1);",
          "  }",
          "  return sheet;",
          "}",
          "",
          "function doPost(e) {",
          "  const lock = LockService.getScriptLock();",
          "  lock.tryLock(10000);",
          "  try {",
          "    const sheet = getOrCreateSheet();",
          "    const body = JSON.parse(e.postData.contents);",
          "    const id = String(body.id || ('CQ-' + new Date().getTime()));",
          "    const mc = body.mcAnswers || {};",
          "    const rowValues = [",
          "      id,",
          "      body.timestamp || new Date().toLocaleString('id-ID'),",
          "      body.name || '-',",
          "      body.prodi || '-',",
          "      body.mcScore || '0/8',",
          "      Number(body.xp || 0),",
          "      mc.Q1 || '-', mc.Q2 || '-', mc.Q3 || '-', mc.Q4 || '-',",
          "      mc.Q5 || '-', mc.Q6 || '-', mc.Q7 || '-', mc.Q8 || '-',",
          "      body.essay9 || '-',",
          "      body.essay10 || '-',",
          "      Number(body.modScore9 || 0),",
          "      body.modComment9 || '',",
          "      Number(body.modScore10 || 0),",
          "      body.modComment10 || '',",
          "      body.gradedByMod ? 'Sudah Dinilai Moderator' : 'Menunggu Penilaian',",
          "      JSON.stringify(body.rawSubmission || body)",
          "    ];",
          "    const lastRow = sheet.getLastRow();",
          "    let foundRow = -1;",
          "    if (lastRow > 1) {",
          "      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();",
          "      for (let i = 0; i < ids.length; i++) {",
          "        if (String(ids[i][0]) === id) { foundRow = i + 2; break; }",
          "      }",
          "    }",
          "    if (foundRow !== -1) {",
          "      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);",
          "    } else {",
          "      sheet.appendRow(rowValues);",
          "    }",
          "    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', id: id })).setMimeType(ContentService.MimeType.JSON);",
          "  } catch (err) {",
          "    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);",
          "  } finally {",
          "    lock.releaseLock();",
          "  }",
          "}",
          "",
          "function doGet(e) {",
          "  try {",
          "    const sheet = getOrCreateSheet();",
          "    const lastRow = sheet.getLastRow();",
          "    if (lastRow <= 1) {",
          "      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', submissions: [] })).setMimeType(ContentService.MimeType.JSON);",
          "    }",
          "    const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();",
          "    const submissions = [];",
          "    for (let i = 0; i < rows.length; i++) {",
          "      const r = rows[i];",
          "      if (!r[0] && !r[2]) continue;",
          "      let obj = null;",
          "      try { obj = r[21] ? JSON.parse(r[21]) : null; } catch (err) { obj = null; }",
          "      if (!obj) {",
          "        obj = {",
          "          id: String(r[0]), docId: String(r[0]),",
          "          submittedAtWIB: String(r[1]),",
          "          studentName: String(r[2]), studentClass: String(r[3]),",
          "          mcqScore: parseInt(String(r[4]).split('/')[0], 10) || 0,",
          "          mcqPercentage: Math.round(((parseInt(String(r[4]).split('/')[0], 10) || 0) / 8) * 100),",
          "          xp: Number(r[5] || 0),",
          "          essay9: { part1_mengapa_apatis: String(r[14]), part2_dua_tindakan: '', moderatorScore: Number(r[16] || 0), moderatorComment: String(r[17] || '') },",
          "          essay10: { part1_bentuk_apatisme: String(r[15]), part2_aksi_dan_alasan: '', moderatorScore: Number(r[18] || 0), moderatorComment: String(r[19] || '') }",
          "        };",
          "      } else {",
          "        if (!obj.essay9) obj.essay9 = {};",
          "        if (!obj.essay10) obj.essay10 = {};",
          "        obj.essay9.moderatorScore = Number(r[16] || obj.essay9.moderatorScore || 0);",
          "        obj.essay9.moderatorComment = String(r[17] || obj.essay9.moderatorComment || '');",
          "        obj.essay10.moderatorScore = Number(r[18] || obj.essay10.moderatorScore || 0);",
          "        obj.essay10.moderatorComment = String(r[19] || obj.essay10.moderatorComment || '');",
          "        obj.moderatorReviewed = (String(r[20]) === 'Sudah Dinilai Moderator') || Boolean(obj.moderatorReviewed);",
          "      }",
          "      submissions.push(obj);",
          "    }",
          "    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', submissions: submissions })).setMimeType(ContentService.MimeType.JSON);",
          "  } catch (err) {",
          "    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString(), submissions: [] })).setMimeType(ContentService.MimeType.JSON);",
          "  }",
          "}"
        ].join("\n");
      }

      window.toggleAppsScriptModal = function () {
        playSound("click");
        const panel = document.getElementById("appsScriptGuidePanel");
        const pre = document.getElementById("appsScriptCodeBlock");
        if (pre && !pre.textContent) {
          pre.textContent = getAppsScriptCodeText();
        }
        if (panel) panel.classList.toggle("hidden");
      };

      window.copyAppsScriptCode = function () {
        copyTextToClipboard(getAppsScriptCodeText());
        playSound("powerup");
        const btn = document.getElementById("btnCopyCodeGs");
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = "<span>✅ Kode Code.gs Disalin!</span>";
          setTimeout(function () { btn.innerHTML = orig; }, 2400);
        }
      };

      // =========================================================================
      // 11. MODERATOR COMMAND CENTER (PIN: kel8juara) & ESSAY EVALUATION
      // =========================================================================
      window.openModeratorAuth = function () {
        playSound("click");
        const modal = document.getElementById("moderatorPinModal");
        const input = document.getElementById("moderatorPinInput");
        const err = document.getElementById("moderatorPinError");
        if (err) err.classList.add("hidden");
        if (input) {
          input.value = "";
          input.type = "password";
        }
        const toggleBtn = document.getElementById("btnTogglePinVis");
        if (toggleBtn) toggleBtn.textContent = "Lihat";
        if (modal) modal.classList.remove("hidden");
        if (input) setTimeout(function () { input.focus(); }, 60);
      };

      window.closeModeratorAuth = function () {
        playSound("click");
        const modal = document.getElementById("moderatorPinModal");
        if (modal) modal.classList.add("hidden");
      };

      window.togglePinVisibility = function () {
        const input = document.getElementById("moderatorPinInput");
        const btn = document.getElementById("btnTogglePinVis");
        if (!input || !btn) return;
        if (input.type === "password") {
          input.type = "text";
          btn.textContent = "Sembunyikan";
        } else {
          input.type = "password";
          btn.textContent = "Lihat";
        }
      };

      window.verifyModeratorPin = function () {
        const input = document.getElementById("moderatorPinInput");
        const err = document.getElementById("moderatorPinError");
        const card = document.getElementById("moderatorPinCard");
        const val = input ? input.value.trim() : "";

        if (val !== MODERATOR_PIN_CODE) {
          playSound("wrong");
          if (err) err.classList.remove("hidden");
          if (card) {
            card.classList.remove("animate-shake");
            void card.offsetWidth;
            card.classList.add("animate-shake");
          }
          return;
        }

        playSound("powerup");
        const modal = document.getElementById("moderatorPinModal");
        if (modal) modal.classList.add("hidden");

        if (state.screen !== "moderator") {
          state.previousScreenBeforeMod = state.screen || "start";
        }

        const urlInput = document.getElementById("gsheetsWebAppUrlInput");
        if (urlInput && runtimeGoogleSheetsUrl) {
          urlInput.value = runtimeGoogleSheetsUrl;
        }
        updateSheetsStatusBadge();
        showScreen("moderator");
        window.renderModeratorDashboard();

        if (runtimeGoogleSheetsUrl) {
          window.testAndSyncSheets();
        }
      };

      window.closeModeratorDashboard = function () {
        playSound("click");
        showScreen(state.previousScreenBeforeMod || "start");
      };

      function getEffectiveTotalXp(sub) {
        const base = Number(sub.baseXp !== undefined ? sub.baseXp : (sub.xp || 0));
        const b9 = Number((sub.essay9 && sub.essay9.moderatorScore) || 0);
        const b10 = Number((sub.essay10 && sub.essay10.moderatorScore) || 0);
        return base + b9 + b10;
      }

      window.renderModeratorDashboard = function () {
        const list = state.submissions || [];
        const total = list.length;

        const totalEl = document.getElementById("modStatTotalCount");
        const avgMcqEl = document.getElementById("modStatAvgMcq");
        const avgPctEl = document.getElementById("modStatAvgPct");
        const avgXpEl = document.getElementById("modStatAvgXp");
        const essayRateEl = document.getElementById("modStatEssayRate");

        if (totalEl) totalEl.textContent = String(total);

        if (total === 0) {
          if (avgMcqEl) avgMcqEl.textContent = "0.0 / 8";
          if (avgPctEl) avgPctEl.textContent = "Akurasi Kelas: 0%";
          if (avgXpEl) avgXpEl.textContent = "0 XP";
          if (essayRateEl) essayRateEl.textContent = "0%";
        } else {
          const sumMcq = list.reduce(function (acc, s) { return acc + Number(s.mcqScore || 0); }, 0);
          const sumXp = list.reduce(function (acc, s) { return acc + getEffectiveTotalXp(s); }, 0);
          const essayDone = list.filter(function (s) {
            const has9 = s.essay9 && (s.essay9.part1_mengapa_apatis || s.essay9.part2_dua_tindakan);
            const has10 = s.essay10 && (s.essay10.part1_bentuk_apatisme || s.essay10.part2_aksi_dan_alasan);
            return has9 && has10;
          }).length;

          const avgMcq = (sumMcq / total).toFixed(1);
          const avgPct = Math.round((sumMcq / (total * 8)) * 100);
          const avgXp = Math.round(sumXp / total);
          const essayPct = Math.round((essayDone / total) * 100);

          if (avgMcqEl) avgMcqEl.textContent = avgMcq + " / 8";
          if (avgPctEl) avgPctEl.textContent = "Akurasi Kelas: " + avgPct + "%";
          if (avgXpEl) avgXpEl.textContent = avgXp + " XP";
          if (essayRateEl) essayRateEl.textContent = essayPct + "%";
        }

        // Render per-question analytics (Soal 1 - 8)
        const analyticsGrid = document.getElementById("modQuestionAnalyticsGrid");
        if (analyticsGrid) {
          analyticsGrid.innerHTML = BAGIAN_A_QUESTIONS.map(function (q, idx) {
            let correctCount = 0;
            list.forEach(function (s) {
              if (Array.isArray(s.mcqAnswers) && s.mcqAnswers[idx] && s.mcqAnswers[idx].isCorrect) {
                correctCount += 1;
              }
            });
            const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            return (
              '<div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">' +
                '<div class="flex items-center justify-between text-xs">' +
                  '<span class="font-display font-bold text-slate-800 dark:text-slate-100">Soal ' + q.id + '</span>' +
                  '<span class="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">' + pct + '%</span>' +
                '</div>' +
                '<div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">' +
                  '<div class="h-full bg-indigo-600 rounded-full transition-all" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<span class="font-sans text-[11px] text-slate-500 block truncate">' + escapeHtml(q.category) + '</span>' +
              '</div>'
            );
          }).join("");
        }

        // Filter and sort table
        const searchInput = document.getElementById("modSearchInput");
        const sortSelect = document.getElementById("modSortSelect");
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const sortMode = sortSelect ? sortSelect.value : "newest";

        let filtered = list.filter(function (s) {
          if (!query) return true;
          const n = (s.studentName || "").toLowerCase();
          const c = (s.studentClass || "").toLowerCase();
          return n.indexOf(query) !== -1 || c.indexOf(query) !== -1;
        });

        filtered.sort(function (a, b) {
          if (sortMode === "oldest") return (a.submittedAtMs || 0) - (b.submittedAtMs || 0);
          if (sortMode === "highest_mcq") return (b.mcqScore || 0) - (a.mcqScore || 0);
          if (sortMode === "highest_xp") return getEffectiveTotalXp(b) - getEffectiveTotalXp(a);
          if (sortMode === "name_asc") return (a.studentName || "").localeCompare(b.studentName || "");
          return (b.submittedAtMs || 0) - (a.submittedAtMs || 0);
        });

        const tbody = document.getElementById("modSubmissionsTableBody");
        if (!tbody) return;

        if (filtered.length === 0) {
          tbody.innerHTML =
            '<tr><td colspan="7" class="py-10 px-4 text-center text-slate-500 dark:text-slate-400">' +
              'Belum ada data pengerjaan mahasiswa yang cocok. Gunakan tombol <strong>"🧪 + Data Simulasi"</strong> atau kerjakan kuis terlebih dahulu.' +
            '</td></tr>';
          return;
        }

        tbody.innerHTML = filtered.map(function (s, idx) {
          const docId = s.docId || s.id;
          const totalXp = getEffectiveTotalXp(s);
          const reviewedBadge = s.moderatorReviewed
            ? '<span class="ml-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">★ Dinilai</span>'
            : '';

          return (
            '<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">' +
              '<td class="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">' + (idx + 1) + '</td>' +
              '<td class="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">' + escapeHtml(s.submittedAtWIB || "-") + '</td>' +
              '<td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">' + escapeHtml(s.studentName || "-") + reviewedBadge + '</td>' +
              '<td class="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300">' + escapeHtml(s.studentClass || "-") + '</td>' +
              '<td class="py-3.5 px-4 font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">' + (s.mcqScore || 0) + '/8 (' + (s.mcqPercentage || 0) + '%)</td>' +
              '<td class="py-3.5 px-4 font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">' + totalXp + ' XP</td>' +
              '<td class="py-3.5 px-4 text-right">' +
                '<button type="button" onclick="window.openInspectModal(\'' + escapeHtml(docId) + '\')" class="btn-3d btn-3d-indigo px-3.5 py-1.5 rounded-xl font-display font-bold text-xs">' +
                  '👁️ Lihat &amp; Nilai Esai' +
                '</button>' +
              '</td>' +
            '</tr>'
          );
        }).join("");
      };

      window.openInspectModal = function (docId) {
        const sub = state.submissions.find(function (s) { return (s.docId || s.id) === docId; });
        if (!sub) return;

        playSound("click");
        state.inspectedDocId = docId;

        const e9 = sub.essay9 || {};
        const e10 = sub.essay10 || {};
        const bonus9 = Number(e9.moderatorScore || 0);
        const bonus10 = Number(e10.moderatorScore || 0);
        const totalXp = getEffectiveTotalXp(sub);

        const nameEl = document.getElementById("inspStudentName");
        const clsEl = document.getElementById("inspClassBadge");
        const timeEl = document.getElementById("inspTimeBadge");
        const mcqEl = document.getElementById("inspMcqScore");
        const xpEl = document.getElementById("inspXpStreak");
        const bonusEl = document.getElementById("inspModBonusTotal");
        const savedBadge = document.getElementById("modReviewSavedBadge");

        if (nameEl) nameEl.textContent = sub.studentName || "-";
        if (clsEl) clsEl.textContent = sub.studentClass || "-";
        if (timeEl) timeEl.textContent = sub.submittedAtWIB || "-";
        if (mcqEl) mcqEl.textContent = (sub.mcqScore || 0) + "/8 (" + (sub.mcqPercentage || 0) + "%)";
        if (xpEl) xpEl.textContent = totalXp + " XP";
        if (bonusEl) bonusEl.textContent = "+" + (bonus9 + bonus10) + " Poin";
        if (savedBadge) savedBadge.classList.toggle("hidden", !sub.moderatorReviewed);

        // Populate Essay responses
        const essayBox = document.getElementById("inspEssayContainer");
        if (essayBox) {
          essayBox.innerHTML =
            '<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">' +
              '<span class="font-display font-bold text-sm text-indigo-700 dark:text-indigo-300 block">Soal 9 — Analisis Kasus Biaya Transportasi Umum</span>' +
              '<p class="text-xs text-slate-600 dark:text-slate-300"><strong>1. Mengapa mendorong apatisme:</strong> ' + escapeHtml(e9.part1_mengapa_apatis || "-") + '</p>' +
              '<p class="text-xs text-slate-600 dark:text-slate-300"><strong>2. Dua tindakan konkret:</strong> ' + escapeHtml(e9.part2_dua_tindakan || "-") + '</p>' +
            '</div>' +
            '<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">' +
              '<span class="font-display font-bold text-sm text-emerald-700 dark:text-emerald-300 block">Soal 10 — Refleksi &amp; Proyeksi Aksi Kampus</span>' +
              '<p class="text-xs text-slate-600 dark:text-slate-300"><strong>1. Bentuk apatisme mahasiswa:</strong> ' + escapeHtml(e10.part1_bentuk_apatisme || "-") + '</p>' +
              '<p class="text-xs text-slate-600 dark:text-slate-300"><strong>2. Rancangan aksi, alasan &amp; harapan:</strong> ' + escapeHtml(e10.part2_aksi_dan_alasan || "-") + '</p>' +
            '</div>';
        }

        // Pre-fill Moderator Grading Form
        const s9Input = document.getElementById("modScoreEssay9");
        const c9Input = document.getElementById("modCommentEssay9");
        const s10Input = document.getElementById("modScoreEssay10");
        const c10Input = document.getElementById("modCommentEssay10");

        if (s9Input) s9Input.value = bonus9 || "";
        if (c9Input) c9Input.value = e9.moderatorComment || "";
        if (s10Input) s10Input.value = bonus10 || "";
        if (c10Input) c10Input.value = e10.moderatorComment || "";

        // Populate MCQ Details
        const mcqBox = document.getElementById("inspMcqContainer");
        if (mcqBox) {
          mcqBox.innerHTML = BAGIAN_A_QUESTIONS.map(function (q, idx) {
            const rec = (Array.isArray(sub.mcqAnswers) && sub.mcqAnswers[idx])
              ? sub.mcqAnswers[idx]
              : { selectedOption: "-", isCorrect: false };
            return (
              '<div class="p-3 rounded-xl border ' + (rec.isCorrect ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20') + ' text-xs">' +
                '<div class="flex items-center justify-between font-bold">' +
                  '<span>Soal ' + q.id + ' (' + escapeHtml(q.category) + ')</span>' +
                  '<span>' + (rec.isCorrect ? '✓ Benar' : '✕ Salah (Kunci: ' + q.correctLetter + ')') + '</span>' +
                '</div>' +
                '<p class="text-slate-600 dark:text-slate-300 mt-1">Dipilih: <strong>' + escapeHtml(rec.selectedOption) + '</strong></p>' +
              '</div>'
            );
          }).join("");
        }

        const modal = document.getElementById("studentDetailModal");
        if (modal) modal.classList.remove("hidden");
      };

      window.closeInspectModal = function () {
        playSound("click");
        const modal = document.getElementById("studentDetailModal");
        if (modal) modal.classList.add("hidden");
      };

      window.saveModeratorFeedback = async function () {
        if (!state.inspectedDocId) return;
        const sub = state.submissions.find(function (s) { return (s.docId || s.id) === state.inspectedDocId; });
        if (!sub) return;

        const s9 = Math.max(0, Number((document.getElementById("modScoreEssay9") || {}).value || 0));
        const c9 = ((document.getElementById("modCommentEssay9") || {}).value || "").trim();
        const s10 = Math.max(0, Number((document.getElementById("modScoreEssay10") || {}).value || 0));
        const c10 = ((document.getElementById("modCommentEssay10") || {}).value || "").trim();

        if (!sub.essay9) sub.essay9 = {};
        if (!sub.essay10) sub.essay10 = {};

        sub.essay9.moderatorScore = s9;
        sub.essay9.moderatorComment = c9;
        sub.essay10.moderatorScore = s10;
        sub.essay10.moderatorComment = c10;
        sub.moderatorReviewed = true;

        saveSubmissionsToStorage(state.submissions);
        playSound("powerup");

        const bonusEl = document.getElementById("inspModBonusTotal");
        const xpEl = document.getElementById("inspXpStreak");
        const savedBadge = document.getElementById("modReviewSavedBadge");
        const statusText = document.getElementById("modEvaluationStatusText");

        if (bonusEl) bonusEl.textContent = "+" + (s9 + s10) + " Poin";
        if (xpEl) xpEl.textContent = getEffectiveTotalXp(sub) + " XP";
        if (savedBadge) savedBadge.classList.remove("hidden");
        if (statusText) {
          statusText.textContent = "✅ Nilai tambahan (+" + (s9 + s10) + " Poin) & komentar untuk " + sub.studentName + " tersimpan!";
        }

        window.renderModeratorDashboard();
        if (runtimeGoogleSheetsUrl) {
          await postSubmissionToGoogleSheets(sub, "updateGrade");
        }
      };

      window.copyInspectedStudentReport = function () {
        if (!state.inspectedDocId) return;
        const sub = state.submissions.find(function (s) { return (s.docId || s.id) === state.inspectedDocId; });
        if (!sub) return;

        const e9 = sub.essay9 || {};
        const e10 = sub.essay10 || {};
        const text = [
          "HASIL KUIS CIVIC QUEST — " + sub.studentName + " (" + sub.studentClass + ")",
          "Waktu Submit: " + (sub.submittedAtWIB || "-"),
          "Skor PG: " + (sub.mcqScore || 0) + "/8 (" + (sub.mcqPercentage || 0) + "%)",
          "Total XP: " + getEffectiveTotalXp(sub) + " XP",
          "",
          "Esai Soal 9.1: " + (e9.part1_mengapa_apatis || "-"),
          "Esai Soal 9.2: " + (e9.part2_dua_tindakan || "-"),
          "Nilai & Komentar Moderator Soal 9: +" + (e9.moderatorScore || 0) + " Poin | " + (e9.moderatorComment || "-"),
          "",
          "Esai Soal 10.1: " + (e10.part1_bentuk_apatisme || "-"),
          "Esai Soal 10.2: " + (e10.part2_aksi_dan_alasan || "-"),
          "Nilai & Komentar Moderator Soal 10: +" + (e10.moderatorScore || 0) + " Poin | " + (e10.moderatorComment || "-")
        ].join("\n");

        copyTextToClipboard(text);
        playSound("powerup");
        const btn = document.getElementById("btnCopySingleStudent");
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = "<span>✅ Disalin!</span>";
          setTimeout(function () { btn.innerHTML = orig; }, 2000);
        }
      };

      window.seedDemoSubmission = function () {
        playSound("powerup");
        const samples = [
          { name: "Nadira Putri Pratama", cls: "Matematika/SS18", score: 8 },
          { name: "Raka Aditya Wijaya", cls: "Matematika/SS18", score: 7 },
          { name: "Kirana Larasati", cls: "Matematika/SS18", score: 6 }
        ];
        const pick = samples[state.submissions.length % samples.length];
        const now = new Date();
        const demoId = "CQ-DEMO-" + now.getTime();

        const demoMcq = BAGIAN_A_QUESTIONS.map(function (q, idx) {
          const ok = idx < pick.score;
          const letter = ok ? q.correctLetter : (q.correctLetter === "A" ? "B" : "A");
          const opt = q.options.find(function (o) { return o.letter === letter; });
          return {
            questionId: q.id,
            selectedOption: letter,
            selectedText: opt ? opt.text : "-",
            correctOption: q.correctLetter,
            isCorrect: ok,
            earnedXp: ok ? 115 : 0
          };
        });

        const demoSub = {
          id: demoId,
          docId: demoId,
          studentName: pick.name,
          studentClass: pick.cls,
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
            part1_bentuk_apatisme: "Menganggap kewajiban warga negara selesai setelah pemilu sehingga abai mengawasi kebijakan publik.",
            part2_aksi_dan_alasan: "Membuat Klinik Literasi Kebijakan Kampus untuk menjembatani kesenjangan pemuda yang kenal konsep (96,3%) namun belum paham proses (43,7%).",
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

        state.submissions.unshift(demoSub);
        saveSubmissionsToStorage(state.submissions);
        updateHud();
        window.renderModeratorDashboard();
        if (runtimeGoogleSheetsUrl) {
          postSubmissionToGoogleSheets(demoSub, "submitQuiz");
        }
      };

      window.exportModeratorCSV = function () {
        playSound("powerup");
        const headers = [
          "No", "Waktu Submit", "Nama Lengkap", "Program Studi / Kelas",
          "Skor PG (Benar/8)", "Akurasi PG (%)", "Total XP (Termasuk Bonus)",
          "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
          "Esai 9.1 (Mengapa Apatis)", "Esai 9.2 (2 Tindakan Konkret)",
          "Bonus XP Esai 9", "Komentar Moderator Esai 9",
          "Esai 10.1 (Bentuk Apatisme)", "Esai 10.2 (Aksi & Harapan)",
          "Bonus XP Esai 10", "Komentar Moderator Esai 10"
        ];

        function csvCell(val) {
          const str = String(val === null || val === undefined ? "" : val).replace(/"/g, '""');
          return '"' + str + '"';
        }

        const rows = [headers.map(csvCell).join(",")];
        state.submissions.forEach(function (s, idx) {
          const e9 = s.essay9 || {};
          const e10 = s.essay10 || {};
          const mcCols = BAGIAN_A_QUESTIONS.map(function (q, i) {
            const rec = (Array.isArray(s.mcqAnswers) && s.mcqAnswers[i]) ? s.mcqAnswers[i] : { selectedOption: "-", isCorrect: false };
            return rec.selectedOption + " (" + (rec.isCorrect ? "Benar" : "Salah") + ")";
          });

          const row = [
            idx + 1,
            s.submittedAtWIB || "-",
            s.studentName || "-",
            s.studentClass || "-",
            (s.mcqScore || 0) + "/8",
            (s.mcqPercentage || 0) + "%",
            getEffectiveTotalXp(s),
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
        a.download = "Rekap_CivicQuest_ApatismePublik_" + new Date().toISOString().slice(0, 10) + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // =========================================================================
      // 12. CONFETTI CELEBRATION ANIMATION
      // =========================================================================
      function launchConfetti() {
        const canvas = document.getElementById("confettiCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.classList.remove("hidden");

        const colors = ["#4F46E5", "#10B981", "#F59E0B", "#F43F5E", "#06B6D4"];
        const pieces = [];
        for (let i = 0; i < 90; i++) {
          pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 6,
            h: Math.random() * 6 + 4,
            color: colors[i % colors.length],
            vy: Math.random() * 3.5 + 2.5,
            vx: (Math.random() - 0.5) * 2
          });
        }

        let frames = 0;
        function animateConfetti() {
          frames += 1;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          pieces.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
          });
          if (frames < 130) {
            requestAnimationFrame(animateConfetti);
          } else {
            canvas.classList.add("hidden");
          }
        }
        requestAnimationFrame(animateConfetti);
      }

      // =========================================================================
      // 13. KEYBOARD SHORTCUTS & EXPLICIT DOM EVENT BINDINGS (INITAPP)
      // =========================================================================
      function handleGlobalKeydown(e) {
        if (state.screen === "mc") {
          const key = e.key.toUpperCase();
          const mapNum = { "1": "A", "2": "B", "3": "C", "4": "D" };
          const letter = mapNum[key] || (["A", "B", "C", "D"].indexOf(key) !== -1 ? key : null);

          if (letter && !state.mcLocked) {
            e.preventDefault();
            window.selectOption(letter);
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (!state.mcLocked && state.mcSelectedLetter) {
              window.checkAnswer();
            } else if (state.mcLocked) {
              window.nextQuestion();
            }
          } else if (key === "F" && !state.mcLocked) {
            e.preventDefault();
            window.useFiftyFifty();
          } else if (key === "H" && !state.mcLocked) {
            e.preventDefault();
            window.useHint();
          }
        }
      }

      function initApp() {
        updateHud();
        updateSheetsStatusBadge();

        // Explicit addEventListener bindings in addition to inline handlers
        const nameInput = document.getElementById("playerNameInput");
        const classInput = document.getElementById("playerCampusInput");
        if (nameInput) {
          nameInput.addEventListener("input", clearOnboardingError);
          nameInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") window.startQuiz();
          });
        }
        if (classInput) {
          classInput.addEventListener("input", clearOnboardingError);
          classInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") window.startQuiz();
          });
        }

        const pinInput = document.getElementById("moderatorPinInput");
        if (pinInput) {
          pinInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") window.verifyModeratorPin();
          });
        }

        document.addEventListener("keydown", handleGlobalKeydown);

        // If default Google Sheets URL is pre-configured, fetch latest rows silently
        if (runtimeGoogleSheetsUrl) {
          window.testAndSyncSheets();
        }
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
      } else {
        initApp();
      }
    })();
