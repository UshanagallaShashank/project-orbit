// App shell: sidebar plus routed stage, with theme and shared agent-run data provided
// through context so every page reads from the same SSE stream and proposal poller.
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CommandDeck } from './CommandDeck';
import { MissionsPage } from './MissionsPage';
import { OpsPage } from './OpsPage';
import { RunHistoryPage } from './RunHistoryPage';
import { SettingsPage } from './SettingsPage';
import { Sidebar } from './Sidebar';
import { useAgentRuns, type AgentRun } from './useAgentRuns';
import { useProposals, type Proposal } from './useProposals';

type Theme = 'light' | 'dark';

interface OrbitData {
  runs: AgentRun[];
  proposals: Proposal[];
  pending: Proposal[];
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const OrbitContext = createContext<OrbitData | null>(null);

export function useOrbit(): OrbitData {
  const ctx = useContext(OrbitContext);
  if (!ctx) throw new Error('useOrbit must be used inside OrbitApp');
  return ctx;
}

const PAGE_META: Record<string, { title: string; crumb: string }> = {
  '/deck': { title: 'Command Deck', crumb: 'orbit / deck / live' },
  '/missions': { title: 'Missions', crumb: 'orbit / missions / review' },
  '/ops': { title: 'Ops', crumb: 'orbit / ops / personal' },
  '/history': { title: 'Run history', crumb: 'orbit / runs / all' },
  '/settings': { title: 'Settings', crumb: 'orbit / settings / local' },
};

export function OrbitApp() {
  const { runs } = useAgentRuns();
  const { proposals, pending } = useProposals();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const activeCount = useMemo(
    () => new Set(runs.filter((r) => r.status === 'running').map((r) => r.agent_name)).size,
    [runs],
  );

  const meta = PAGE_META[location.pathname] ?? PAGE_META['/deck'];

  const value = useMemo(
    () => ({ runs, proposals, pending, theme, setTheme }),
    [runs, proposals, pending, theme],
  );

  return (
    <OrbitContext.Provider value={value}>
      <div className="app-shell">
        {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
        <Sidebar open={menuOpen} />
        <div className="stage">
          <header className="stage-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <Menu size={15} />
              </button>
              <div>
                <h2>{meta.title}</h2>
                <div className="crumbs">{meta.crumb}</div>
              </div>
            </div>
            <div className="head-right">
              <button
                className="icon-btn"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button className="icon-btn" aria-label="Notifications">
                <Bell size={15} />
              </button>
              <span className={`session-pill${activeCount > 0 ? ' live' : ''}`}>
                <span className="d" />
                {activeCount}
                <span className="lbl"> agent{activeCount === 1 ? '' : 's'} active</span>
              </span>
            </div>
          </header>
          <div className="stage-scroll">
            <div className="page" key={location.pathname}>
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
          </div>
        </div>
      </div>
    </OrbitContext.Provider>
  );
}
