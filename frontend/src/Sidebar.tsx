// Left rail: brand, search, workspace nav, live station roster (driven by real runs),
// signals (pending permissions, budget), and the session footer.
import {
  AlertTriangle,
  Clock,
  GitPullRequest,
  LayoutGrid,
  PieChart,
  Search,
  Settings,
  Target,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AGENT_KEYS, AGENT_REGISTRY } from './agentRegistry';
import { useOrbit } from './OrbitApp';
import type { Summary } from './useExpenses';

const NAV = [
  { to: '/deck', label: 'Command Deck', icon: Target },
  { to: '/missions', label: 'Missions', icon: GitPullRequest },
  { to: '/ops', label: 'Ops', icon: LayoutGrid },
  { to: '/history', label: 'Run history', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const VISIBLE_STATIONS = 7;

export function Sidebar({ open }: { open: boolean }) {
  const { runs, pending } = useOrbit();
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('/expenses/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const busyAgents = useMemo(() => {
    const busy = new Set<string>();
    for (const run of runs) if (run.status === 'running') busy.add(run.agent_name);
    return busy;
  }, [runs]);

  const stations = useMemo(() => {
    const list = AGENT_KEYS.map((key) => ({
      key,
      label: AGENT_REGISTRY[key].label,
      busy: busyAgents.has(key),
    }));
    const q = query.trim().toLowerCase();
    const filtered = q ? list.filter((s) => s.label.toLowerCase().includes(q)) : list;
    return filtered.sort((a, b) => Number(b.busy) - Number(a.busy));
  }, [busyAgents, query]);

  const shown = query ? stations : stations.slice(0, VISIBLE_STATIONS);
  const hiddenCount = stations.length - shown.length;
  const budgetLeft =
    summary && summary.budget > 0 ? Math.max(0, Math.round((summary.remaining / summary.budget) * 100)) : null;

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand">
        <div className="mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </div>
        <span className="name">Orbit</span>
        <span className="env">prod</span>
      </div>

      <label className="side-search">
        <Search size={13} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stations..."
        />
      </label>

      <div className="section-label">Workspace</div>
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon size={15} />
          {label}
          {to === '/missions' && pending.length > 0 && <span className="nav-badge">{pending.length}</span>}
        </NavLink>
      ))}

      <div className="section-label">
        Stations <span>{busyAgents.size}/{AGENT_KEYS.length} active</span>
      </div>
      {shown.map((station) => (
        <div key={station.key} className={`station-row${station.busy ? ' busy' : ''}`}>
          <span className="status-dot" />
          <span className="sname">{station.label}</span>
          <span className="swhat">{station.busy ? 'running' : 'idle'}</span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="station-row">
          <span className="status-dot" style={{ opacity: 0 }} />
          <span className="sname" style={{ color: 'var(--ink-faint)' }}>+{hiddenCount} more</span>
        </div>
      )}

      <div className="section-label">Signals</div>
      <NavLink to="/missions" className="nav-item">
        <AlertTriangle size={15} />
        Permissions
        {pending.length > 0 && <span className="nav-badge">{pending.length}</span>}
      </NavLink>
      <NavLink to="/ops" className="nav-item">
        <PieChart size={15} />
        {budgetLeft != null ? `Budget - ${budgetLeft}% left` : 'Budget overview'}
      </NavLink>

      <div className="side-foot">
        <div className="avatar" />
        <div className="who">
          <div className="u">Ushanagalla</div>
          <div className="s">local session</div>
        </div>
      </div>
    </aside>
  );
}
