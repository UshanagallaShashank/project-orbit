// Left rail: search, primary nav, a live station list, and a signals group - lucide-react
// icons throughout instead of hand-drawn SVG, real backend counts, no mocked numbers.
import {
  AlertTriangle,
  Bot,
  GitBranch,
  Grid3x3,
  History,
  LayoutGrid,
  Orbit,
  PieChart,
  Search,
  Settings,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AGENT_KEYS, AGENT_REGISTRY, type AgentKey } from './agentRegistry';
import { useAgentRuns } from './useAgentRuns';
import { useProposals } from './useProposals';

const NAV_ITEMS = [
  { to: '/deck', label: 'Command Deck', icon: LayoutGrid },
  { to: '/missions', label: 'Missions', icon: GitBranch, badgeKey: 'missions' as const },
  { to: '/ops', label: 'Ops', icon: Grid3x3 },
  { to: '/history', label: 'Run history', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const VISIBLE_STATIONS = 6;

export function Sidebar() {
  const { runs } = useAgentRuns();
  const { pending } = useProposals();

  const runningByAgent = new Map<AgentKey, string>();
  for (const run of runs) {
    if (run.status === 'running' && !runningByAgent.has(run.agent_name as AgentKey)) {
      runningByAgent.set(run.agent_name as AgentKey, run.request.slice(0, 22));
    }
  }
  const busyKeys = AGENT_KEYS.filter((k) => runningByAgent.has(k));
  const idleKeys = AGENT_KEYS.filter((k) => !runningByAgent.has(k));
  const shownIdle = idleKeys.slice(0, Math.max(0, VISIBLE_STATIONS - busyKeys.length));
  const overflowCount = idleKeys.length - shownIdle.length;

  return (
    <aside
      className="flex h-full w-[264px] flex-shrink-0 flex-col overflow-y-auto border-r"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, var(--color-signal), #ff5f9e)' }}
        >
          <Orbit size={17} color="var(--color-void, #08090d)" strokeWidth={2.25} />
        </div>
        <span className="font-display text-[16px] font-bold tracking-tight">Orbit</span>
        <span
          className="ml-auto rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
        >
          local
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <button
          className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[13px] transition-colors hover:border-[var(--color-text-tertiary)]"
          style={{
            background: 'var(--color-surface-raised)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <Search size={14} />
          <span>Search agents, runs…</span>
          <kbd
            className="ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            className="group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-signal-soft)' : 'transparent',
              color: isActive ? 'var(--color-signal)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: 'var(--color-signal)' }}
                  />
                )}
                <Icon size={16} strokeWidth={isActive ? 2.25 : 2} />
                <span>{label}</span>
                {badgeKey === 'missions' && pending.length > 0 && (
                  <span
                    className="ml-auto rounded-full px-1.5 py-px font-mono text-[10px] font-bold leading-[16px]"
                    style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
                  >
                    {pending.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Stations */}
      <div className="mt-6 flex items-center justify-between px-4 pb-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
          Stations
        </span>
        <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {busyKeys.length}/{AGENT_KEYS.length} active
        </span>
      </div>
      <div className="flex flex-col gap-px px-2">
        {busyKeys.map((key) => (
          <div
            key={key}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px]"
            style={{ background: 'var(--color-signal-soft)' }}
          >
            <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
              <span
                className="absolute h-4 w-4 animate-ping rounded-full opacity-40"
                style={{ background: 'var(--color-signal)' }}
              />
              <Bot size={13} style={{ color: 'var(--color-signal)' }} strokeWidth={2.25} />
            </span>
            <span className="truncate font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {AGENT_REGISTRY[key].label.toLowerCase()}
            </span>
            <span
              className="ml-auto max-w-[92px] truncate text-[11px]"
              style={{ color: 'var(--color-text-tertiary)' }}
              title={runningByAgent.get(key)}
            >
              {runningByAgent.get(key)}
            </span>
          </div>
        ))}
        {shownIdle.map((key) => (
          <div
            key={key}
            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:bg-[var(--color-surface-raised)]"
          >
            <Bot size={13} className="flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} strokeWidth={2} />
            <span className="truncate font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              {AGENT_REGISTRY[key].label.toLowerCase()}
            </span>
          </div>
        ))}
        {overflowCount > 0 && (
          <button
            className="rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--color-surface-raised)]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            +{overflowCount} more…
          </button>
        )}
      </div>

      {/* Signals */}
      <div className="mt-6 px-4 pb-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
          Signals
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-2 pb-4">
        <NavLink
          to="/missions"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors hover:bg-[var(--color-surface-raised)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <AlertTriangle size={16} />
          Permissions
          {pending.length > 0 && (
            <span
              className="ml-auto rounded-full px-1.5 py-px font-mono text-[10px] font-bold leading-[16px]"
              style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
            >
              {pending.length}
            </span>
          )}
        </NavLink>
        <NavLink
          to="/ops"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors hover:bg-[var(--color-surface-raised)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <PieChart size={16} />
          Budget
        </NavLink>
      </div>

      {/* Session footer */}
      <div
        className="mt-auto flex items-center gap-2.5 border-t px-4 py-3.5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="h-8 w-8 flex-shrink-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, var(--color-violet), var(--color-orbit-cyan))' }}
        />
        <div className="min-w-0 text-[13px]">
          <div className="truncate font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Ushanagalla
          </div>
          <div className="truncate" style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
            local session
          </div>
        </div>
      </div>
    </aside>
  );
}