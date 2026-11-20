import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Award, Home, Sun, Moon, MoreVertical } from 'lucide-react';

export default function Navbar({ currentView, setView, isDark, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const kebabRef = useRef(null);

  // Close kebab dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kebabRef.current && !kebabRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand Identity */}
        <button
          onClick={() => {
            setView('portal');
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none cursor-pointer min-w-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-black text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none truncate">
              PJBL <span className="text-indigo-600 dark:text-indigo-400">DIKWAR</span>
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Pendidikan Kewarganegaraan
            </span>
          </div>
        </button>

        {/* DESKTOP NAVIGATION (Visible on md: and above) */}
        <div className="hidden md:flex items-center gap-2">
          {currentView !== 'portal' && (
            <button
              onClick={() => setView('portal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Portal</span>
            </button>
          )}

          <button
            onClick={() => setView('artikel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'artikel'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-crimson dark:text-rose-300 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-crimson dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-crimson dark:text-rose-400" />
            <span>Majalah Digital</span>
          </button>

          <button
            onClick={() => setView('kuis')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'kuis'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Civic Quest</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

          {/* Desktop Theme Toggle */}
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

        {/* MOBILE NAVIGATION (Visible below md) */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Mobile Theme Toggle */}
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

          {/* Overflow Kebab Menu Button (⋮) */}
          <div className="relative" ref={kebabRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Menu Navigasi"
              aria-label="Buka menu navigasi"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Dropdown Menu Popup */}
            {isMenuOpen && (
              <>
                {/* Backdrop for click outside */}
                <div
                  className="fixed inset-0 z-40 bg-slate-900/25 dark:bg-black/50 backdrop-blur-xs"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />

                <div
                  className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-pop-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Menu Navigasi
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      PJBL DIKWAR
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Portal / Beranda Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setView('portal');
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        currentView === 'portal'
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          currentView === 'portal'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">Portal Beranda</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Halaman utama platform</div>
                        </div>
                      </div>
                      {currentView === 'portal' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mr-1" />
                      )}
                    </button>

                    {/* Majalah Digital Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setView('artikel');
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        currentView === 'artikel'
                          ? 'bg-rose-50/90 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          currentView === 'artikel'
                            ? 'bg-crimson text-white shadow-xs'
                            : 'bg-rose-100 dark:bg-rose-950 text-crimson dark:text-rose-400'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">Majalah Digital</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Artikel &amp; analisis editorial</div>
                        </div>
                      </div>
                      {currentView === 'artikel' && (
                        <span className="w-2 h-2 rounded-full bg-crimson dark:bg-rose-400 shrink-0 mr-1" />
                      )}
                    </button>

                    {/* Civic Quest Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setView('kuis');
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        currentView === 'kuis'
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          currentView === 'kuis'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">Civic Quest</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Kuis interaktif mahasiswa</div>
                        </div>
                      </div>
                      {currentView === 'kuis' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mr-1" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
