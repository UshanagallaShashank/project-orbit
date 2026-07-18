import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CommandDeck } from './CommandDeck';
import { MissionsPage } from './MissionsPage';
import { OpsPage } from './OpsPage';
import { RunHistoryPage } from './RunHistoryPage';
import { SettingsPage } from './SettingsPage';
import { Sidebar } from './Sidebar';

export function OrbitApp() {
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const t = stored || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', t);
  }, []);

  return (
    <div
      className="grid h-screen grid-cols-[272px_1fr] overflow-hidden"
      style={{ background: 'var(--color-void, var(--color-bg))', color: 'var(--color-text-primary)' }}
    >
      <Sidebar />
      <main className="min-h-0 overflow-y-auto p-6">
        <div className="mx-auto h-full min-h-[calc(100vh-3rem)] max-w-[1600px]">
          <Routes>
            <Route path="/" element={<Navigate to="/deck" replace />} />
            <Route path="/deck" element={<CommandDeck />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/ops" element={<OpsPage />} />
            <Route path="/history" element={<RunHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/deck" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
