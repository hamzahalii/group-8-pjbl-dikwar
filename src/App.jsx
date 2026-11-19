import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PortalHome from './components/PortalHome';
import ArtikelView from './components/ArtikelView';
import KuisView from './components/KuisView';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'artikel') return 'artikel';
    if (hash === 'kuis') return 'kuis';
    if (hash === 'admin' || hash === 'moderator') return 'admin';
    return 'portal';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('dikwar_theme_v2');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark class to <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dikwar_theme_v2', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Sync hash with current view
  const setView = (view) => {
    setCurrentView(view);
    window.location.hash = view === 'portal' ? '#/' : `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'artikel') setCurrentView('artikel');
      else if (hash === 'kuis') setCurrentView('kuis');
      else if (hash === 'admin' || hash === 'moderator') setCurrentView('admin');
      else setCurrentView('portal');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar 
        currentView={currentView} 
        setView={setView} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 flex flex-col">
        {currentView === 'portal' && <PortalHome setView={setView} />}
        {currentView === 'artikel' && <ArtikelView setView={setView} />}
        {currentView === 'kuis' && <KuisView setView={setView} />}
        {currentView === 'admin' && <AdminDashboard setView={setView} />}
      </main>
    </div>
  );
}
