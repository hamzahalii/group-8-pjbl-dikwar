import React from 'react';
import { BookOpen, Award, Home, Sun, Moon } from 'lucide-react';

export default function Navbar({ currentView, setView, isDark, toggleTheme }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Identity */}
        <button
          onClick={() => setView('portal')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              PJBL <span className="text-indigo-600 dark:text-indigo-400">DIKWAR</span>
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-0.5">
              Pendidikan Kewarganegaraan
            </span>
          </div>
        </button>

        {/* Center / Navigation Links (Main Menu: Portal, Majalah Digital, Civic Quest) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {currentView !== 'portal' && (
            <button
              onClick={() => setView('portal')}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Portal</span>
            </button>
          )}

          <button
            onClick={() => setView('artikel')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'artikel'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-crimson dark:text-rose-300 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-crimson dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-crimson dark:text-rose-400" />
            <span className="hidden sm:inline">Majalah Digital</span>
            <span className="sm:hidden">Artikel</span>
          </button>

          <button
            onClick={() => setView('kuis')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'kuis'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Civic Quest</span>
            <span className="sm:hidden">Kuis</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label="Toggle Tema"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
