# Platform Pembelajaran Interaktif PJBL DIKWAR
> **Pendidikan Kewarganegaraan: Apatisme Publik, Partisipasi Warga, dan Kedaulatan Demokrasi**  
> *Dibangun menggunakan Node.js, React, Tailwind CSS, dan Vite.*

Aplikasi web modern dan interaktif yang dikembangkan sebagai luaran Project-Based Learning (PJBL) mata kuliah Pendidikan Kewarganegaraan (DIKWAR). Platform ini menyatukan dua pilar pembelajaran: **Jurnalisme Investigatif Mendalam (*Editorial Magazine*)** dan **Arena Gamifikasi Evaluasi Kompetensi (*Gamified Civic Quest*)**.

---

## 🌟 Arsitektur & Pilihan Eksplorasi

Aplikasi menggunakan sistem navigasi responsif (*Single Page Application*) dengan hash routing (`#/`, `#/artikel`, `#/kuis`):

```text
                                       ┌────────────────────────┐
                                       │      Portal Utama      │
                                       │   (PortalHome.jsx)     │
                                       └───────────┬────────────┘
                                                   │
                                  ┌────────────────┴────────────────┐
                                  ▼                                 ▼
                       📖 Majalah Digital                  🎯 Civic Quest
                        (ArtikelView.jsx)                   (KuisView.jsx)
                   • Esai editorial mendalam           • 8 Soal Pilihan Ganda Taktis
                   • Data empiris & grafik riset       • 2 Studi Kasus Reflektif
                   • Studi kasus (Wadas, Ciptaker)     • Gamifikasi XP & Web Audio
                   • Doktrin Meaningful Participation  • Ekspor & Review Hasil
                                                                    │
                                                       (Akses Tombol Header Kuis)
                                                                    ▼
                                                          🛡️ Dashboard Admin
                                                          (AdminDashboard.jsx)
                                                       • Proteksi PIN (kel8juara)
                                                       • Rekap Nilai & Analitik Soal
                                                       • Penilaian Esai 9 & 10
                                                       • Sinkronisasi Google Sheets
```

---

## 🛠️ Stack Teknologi & Dependensi

* **Runtime:** Node.js (v22.x) & npm
* **Framework:** React 18
* **Styling & Desain:** Tailwind CSS 3.4 (dengan tipografi editorial & tombol 3D taktil)
* **Build Tool:** Vite 6 (Blazingly fast development server & production bundler)
* **Database Cloud:** Supabase (`@supabase/supabase-js`)
* **Ikon:** Lucide React
* **Efek & Selebrasi:** Web Audio API (Synthesizer Tonal Dinamis) & Canvas Confetti

---

## 📁 Struktur Direktori Proyek

```text
PJBL DIKWAR/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigasi sticky (Portal, Majalah, Civic Quest) & tema
│   │   ├── PortalHome.jsx       # 2 Pilihan kartu utama (Artikel & Kuis)
│   │   ├── ArtikelView.jsx      # Majalah digital editorial & data visual interaktif
│   │   ├── KuisView.jsx         # Arena kuis gamifikasi & pintu masuk Dashboard Admin
│   │   └── AdminDashboard.jsx   # Dashboard Admin rekapitulasi, penilaian & integrasi cloud
│   │
│   ├── lib/
│   │   ├── supabase.js          # Inisialisasi Supabase client
│   │   └── supabaseDb.js        # Bridge CRUD database (upsert, fetch, grade, count)
│   │
│   ├── data/
│   │   ├── kuisData.js          # Soal MCQ, studi kasus, kata kunci & PIN admin (kel8juara)
│   │   └── artikelData.js       # Data statistik survei 567 pemuda & referensi
│   │
│   ├── App.jsx                  # State controller, SPA hash router & dark mode
│   ├── main.jsx                 # React root renderer
│   └── index.css                # Tailwind directives & kustomisasi 3D/editorial
│
├── legacy/                      # Arsip file monolitik HTML asli
│   ├── civic_quest_kuis_interaktif_demokrasi_kebijakan_publik.html
│   ├── majalah_digital_interaktif_apatisme_publik.html
│   └── index-static.html
│
├── dist/                        # Hasil build produksi siap rilis
├── index.html                   # HTML template Vite
├── package.json                 # Konfigurasi dependensi & script npm
├── vite.config.js               # Konfigurasi Vite & React plugin
└── tailwind.config.js           # Konfigurasi tema warna & font Tailwind
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Menjalankan Mode Pengembangan (Dev Server)
Jalankan perintah berikut di terminal:
```bash
npm run dev
```
Buka peramban pada alamat lokal yang muncul (default: `http://localhost:3000`).

### 2. Membangun Versi Produksi (Production Build)
```bash
npm run build
```
Hasil build yang teroptimasi dan siap diunggah ke hosting (Vercel, Netlify, GitHub Pages) akan tersedia di dalam folder `dist/`.

### 3. Meninjau Hasil Build (Preview)
```bash
npm run preview
```

---

## ⚙️ Panduan Fitur & Dashboard Admin

1. **Akses Dashboard Admin:**
   * Masuk ke menu **Civic Quest**.
   * Klik tombol **"Dashboard Admin"** di pojok kanan atas HUD.
   * Masukkan PIN: `kel8juara`.
2. **Database Cloud Supabase (Utama):**
   * Setiap kali peserta menekan **"Selesai & Kumpulkan"**, jawaban otomatis tersimpan ke tabel `civic_quest_submissions` di Supabase.
   * Admin dapat menekan tombol **"Tarik Supabase"** untuk menyinkronkan seluruh lembar jawaban secara real-time.
   * Penilaian dan catatan esai Soal 9 & 10 oleh Admin langsung tersimpan ke Supabase.
3. **Rekapitulasi Data & Ekspor:**
   * Data tersimpan rapi secara lokal (*localStorage*) sebagai fallback offline, dan dapat diekspor ke format Excel/CSV melalui tombol **"Unduh CSV / Excel"**.
4. **Integrasi Google Sheets (Opsional 2 Arah):**
   * Masukkan URL Google Apps Script Web App pada kolom yang tersedia di Dashboard Admin, lalu klik **"Simpan URL"**.

---

## 🗄️ Skema Database Supabase (SQL Editor)

Jika membuat tabel baru di Supabase, jalankan query berikut di **SQL Editor**:

```sql
create table if not exists public.civic_quest_submissions (
  id text primary key,
  student_name text not null,
  student_class text not null,
  mcq_score int default 0,
  mcq_percentage int default 0,
  xp int default 0,
  base_xp int default 0,
  max_streak int default 0,
  mcq_answers jsonb default '[]'::jsonb,
  essay9 jsonb default '{}'::jsonb,
  essay10 jsonb default '{}'::jsonb,
  admin_reviewed boolean default false,
  submitted_at timestamptz default now(),
  submitted_at_wib text
);

alter table public.civic_quest_submissions enable row level security;

create policy "Allow anonymous insert"
  on public.civic_quest_submissions for insert to anon with check (true);

create policy "Allow anonymous select"
  on public.civic_quest_submissions for select to anon using (true);

create policy "Allow anonymous update"
  on public.civic_quest_submissions for update to anon using (true) with check (true);
```

---

## 👥 Tim & Hak Cipta
* **Mata Kuliah:** Pendidikan Kewarganegaraan (DIKWAR) — Model Pembelajaran Berbasis Masalah (PJBL).
* **Lisensi:** Bebas digunakan untuk keperluan pendidikan, advokasi, dan literasi kewarganegaraan.
