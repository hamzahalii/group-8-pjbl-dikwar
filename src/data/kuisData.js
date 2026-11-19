export const MODERATOR_PIN_CODE = "kel8juara";
export const STORAGE_KEY_SUBMISSIONS = "civic_quest_submissions_v3";
export const STORAGE_KEY_SHEETS_URL = "civic_quest_gsheets_url_v3";

export const BAGIAN_A_QUESTIONS = [
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

export const BAGIAN_B_ESSAYS = [
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
