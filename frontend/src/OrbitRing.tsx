// The orbit ring: every agent station placed on a circle around the Orbit hub, with
// dev-loop and everyday handoff edges, pulse rings on busy stations, and a sweeping arc.
// Pure SVG - no graph library - so it stays weightless and animates smoothly.
import { useMemo } from 'react';
import { AGENT_KEYS, AGENT_REGISTRY, type AgentKey } from './agentRegistry';

const SHORT_LABEL: Record<AgentKey, string> = {
  learning_tracker: 'Learn',
  expense: 'Expense',
  resume: 'Resume',
  memory: 'Memory',
  cost: 'Cost',
  eval: 'Eval',
  idea: 'Idea',
  leetcode: 'Leet',
  project_tracker: 'Projects',
  task: 'Task',
  comms: 'Comms',
  qa: 'QA',
  feature: 'Feature',
  sandbox: 'Sandbox',
};

// Structural handoffs drawn permanently: the dev loop chain in cyan, the everyday
// expense-to-memory handoff in violet, matching the legend below the ring.
const DEV_EDGES: Array<[AgentKey, AgentKey]> = [
  ['feature', 'sandbox'],
  ['sandbox', 'qa'],
];
const EVERYDAY_EDGES: Array<[AgentKey, AgentKey]> = [['expense', 'memory']];

const W = 480;
const H = 350;
const CX = W / 2;
const CY = H / 2;
const R = 128;

interface OrbitRingProps {
  busyAgents: Set<string>;
  onSelectAgent: (agent: AgentKey) => void;
}

export function OrbitRing({ busyAgents, onSelectAgent }: OrbitRingProps) {
  const positions = useMemo(() => {
    const map = new Map<AgentKey, { x: number; y: number }>();
    AGENT_KEYS.forEach((key, i) => {
      const angle = (i / AGENT_KEYS.length) * Math.PI * 2 - Math.PI / 2;
      map.set(key, {
        x: Math.round((CX + R * Math.cos(angle)) * 10) / 10,
        y: Math.round((CY + R * Math.sin(angle)) * 10) / 10,
      });
    });
    return map;
  }, []);

  const edge = (from: AgentKey, to: AgentKey, color: string, width: number, dashed = false) => {
    const a = positions.get(from)!;
    const b = positions.get(to)!;
    return (
      <line
        key={`${from}-${to}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={width}
        opacity={dashed ? 0.35 : 0.6}
        strokeDasharray={dashed ? '3 4' : undefined}
      />
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Agent orbit ring">
      {/* orbit track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 6" />
      {/* sweeping arc */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="1.5"
        strokeDasharray="55 760"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${CX} ${CY}`}
          to={`360 ${CX} ${CY}`}
          dur="7s"
          repeatCount="indefinite"
        />
      </circle>

      {/* faint spokes from hub to each station */}
      {AGENT_KEYS.map((key) => {
        const p = positions.get(key)!;
        return (
          <line
            key={`spoke-${key}`}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke={busyAgents.has(key) ? 'var(--signal)' : 'var(--line)'}
            strokeWidth={busyAgents.has(key) ? 1.6 : 0.7}
            opacity={busyAgents.has(key) ? 0.75 : 0.25}
            strokeDasharray={busyAgents.has(key) ? '4 4' : undefined}
          >
            {busyAgents.has(key) && (
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
            )}
          </line>
        );
      })}

      {/* structural handoff edges */}
      {DEV_EDGES.map(([a, b]) => edge(a, b, 'var(--orbit-cyan)', 2.4))}
      {EVERYDAY_EDGES.map(([a, b]) => edge(a, b, 'var(--violet)', 2))}

      {/* hub */}
      <g className="ring-node">
        <circle cx={CX} cy={CY} r={28} fill="var(--panel-raised)" stroke="var(--line-bright)" strokeWidth="1.5" />
        <g transform={`translate(${CX - 11}, ${CY - 11})`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.7">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </g>
      </g>

      {/* stations */}
      {AGENT_KEYS.map((key) => {
        const p = positions.get(key)!;
        const busy = busyAgents.has(key);
        const category = AGENT_REGISTRY[key].category;
        const restStroke = category === 'dev-loop' ? 'var(--orbit-cyan)' : 'var(--line-bright)';
        return (
          <g
            key={key}
            className="ring-node"
            onClick={() => onSelectAgent(key)}
            fontFamily="var(--font-mono)"
            fontSize="8.6"
          >
            {busy && (
              <circle cx={p.x} cy={p.y} r={24} fill="none" stroke="var(--signal)" strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="20;29;20" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={19}
              fill="var(--panel-raised)"
              stroke={busy ? 'var(--signal)' : restStroke}
              strokeWidth={busy ? 2 : 1.4}
            />
            <text x={p.x} y={p.y + 3} textAnchor="middle" fill={busy ? 'var(--ink)' : 'var(--ink-dim)'}>
              {SHORT_LABEL[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
