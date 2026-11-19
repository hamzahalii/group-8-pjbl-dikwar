import React from 'react';
import { BookOpen, Award, ArrowRight, CheckCircle2, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function PortalHome({ setView }) {
  return (
    <div className="portal-bg flex-1 flex flex-col justify-between transition-colors duration-300">
      
      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center">

        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Proyek Pembelajaran Berbasis Masalah (PJBL)
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5">
            Demokrasi, Partisipasi Publik &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
              Kedaulatan Warga
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Platform edukasi terpadu Pendidikan Kewarganegaraan berbasis React &amp; Tailwind CSS. Silakan pilih jalur pembelajaran yang ingin Anda jelajahi:
          </p>
        </div>

        {/* 2 MAIN SELECTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch max-w-6xl mx-auto w-full mb-16">

          {/* ==========================================
               PILIHAN 1: MAJALAH DIGITAL / ARTIKEL
               ========================================== */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-950/70 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
            
            {/* Subtle Ambient Glow */}
            <div className="absolute -right-16 -top-16 w-52 h-52 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500"></div>

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-crimson dark:text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  Jurnal Warga • Edisi Khusus
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ~5-8 Menit Baca
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-crimson dark:group-hover:text-rose-400 transition-colors">
                Apatisme Publik: Ketika Masyarakat Merasa Suaranya Tak Lagi Berarti
              </h2>

              {/* Excerpt */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                Esai editorial investigatif mendalam. Membedah akar krisis partisipasi warga negara, mitos kepedulian generasi muda, data empiris riset 567 responden, serta 3 pilar meaningful participation.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-crimson dark:text-rose-400 shrink-0" />
                  <span><strong>Data Visual &amp; Grafik Interaktif:</strong> Analisis persepsi politik pemuda Indonesia.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-crimson dark:text-rose-400 shrink-0" />
                  <span><strong>Studi Kasus Konkret:</strong> UU Cipta Kerja, Desa Wadas, &amp; UU ITE.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-crimson dark:text-rose-400 shrink-0" />
                  <span><strong>Fitur Interaktif:</strong> Kontrol font size, generator sitasi, dan progress scroll.</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setView('artikel')}
              className="btn-3d btn-3d-crimson w-full py-4 px-6 rounded-2xl font-sans font-bold text-base flex items-center justify-center gap-2.5 text-center group cursor-pointer shadow-lg"
            >
              <span>Buka Majalah Digital</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

          {/* ==========================================
               PILIHAN 2: CIVIC QUEST / KUIS INTERAKTIF
               ========================================== */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-950/70 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden group shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
            
            {/* Subtle Ambient Glow */}
            <div className="absolute -right-16 -top-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500"></div>

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  Gamifikasi • Arena Kuis
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  10 Tahapan Misi
                </span>
              </div>

              {/* Title */}
              <h2 className="font-quest font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                CIVIC QUEST: Arena Uji Pemahaman Demokrasi
              </h2>

              {/* Excerpt */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                Platform uji kompetensi berbasis gamifikasi taktis. Uji pemahaman materi kewarganegaraan melalui 8 soal pilihan ganda dinamis dan 2 analisis studi kasus kebijakan publik nyata.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span><strong>8 Pilihan Ganda + 2 Studi Kasus:</strong> Skenario taktis dan rubrik penilaian esai.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span><strong>Efek Audio Sintetis &amp; Selebrasi:</strong> Feedback suara taktil Web Audio &amp; confetti.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span><strong>Dashboard Admin Terintegrasi:</strong> Rekap jawaban ke Google Sheets &amp; ekspor CSV.</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setView('kuis')}
              className="btn-3d btn-3d-indigo w-full py-4 px-6 rounded-2xl font-sans font-bold text-base flex items-center justify-center gap-2.5 text-center group cursor-pointer shadow-lg"
            >
              <span>Masuk ke Arena Kuis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

        </div>

        {/* 3 EDUCATIONAL PILLARS */}
        <div className="rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 justify-center md:justify-start">
                <Compass className="w-4 h-4" /> 01. Kontekstual
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Berangkat Dari Masalah Nyata</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Mengkaji kesenjangan antara hak konstitusional warga dan implementasi kebijakan publik di lapangan.</p>
            </div>
            <div className="space-y-1 md:border-l md:border-slate-300 dark:md:border-slate-800 md:pl-6">
              <div className="font-mono text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 justify-center md:justify-start">
                <ShieldAlert className="w-4 h-4" /> 02. Meaningful Participation
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">3 Hak Pokok Warga Negara</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Hak didengar (right to be heard), dipertimbangkan (right to be considered), dan dijelaskan (right to be explained).</p>
            </div>
            <div className="space-y-1 md:border-l md:border-slate-300 dark:md:border-slate-800 md:pl-6">
              <div className="font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 justify-center md:justify-start">
                <Sparkles className="w-4 h-4" /> 03. Evaluasi Terpadu
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Refleksi Kritis Mahasiswa</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Mendorong peserta didik menjadi pemecah masalah (problem solver) kebangsaan menuju Indonesia Emas 2045.</p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-8 transition-colors mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">PJBL Pendidikan Kewarganegaraan (DIKWAR)</span>
            <span>•</span>
            <span>Node.js + React + Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <button onClick={() => setView('artikel')} className="hover:text-crimson transition-colors cursor-pointer">Majalah Digital</button>
            <button onClick={() => setView('kuis')} className="hover:text-indigo-600 transition-colors cursor-pointer">Civic Quest</button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Tahun Ajaran 2026/2027</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
