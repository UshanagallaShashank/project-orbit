// The Command Deck: readout strip, the orbit ring as the dominant left element, a stacked
// right rail (conversation over permissions), and a tool-trace ribbon under the ring.
import { Radio } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AGENT_KEYS, AGENT_REGISTRY, type AgentKey } from './agentRegistry';
import { ConversationPanel } from './ConversationPanel';
import { useOrbit } from './OrbitApp';
import { OrbitRing } from './OrbitRing';
import { PermissionPanel } from './PermissionPanel';
import { ReadoutStrip } from './ReadoutStrip';
import { RunInspector } from './RunInspector';
import { TraceRibbon } from './TraceRibbon';
import { useToolTrace } from './useToolTrace';

export function CommandDeck() {
  const { runs } = useOrbit();
  const { toolCalls } = useToolTrace(runs);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey | null>(null);
  const [ringMode, setRingMode] = useState<'live' | 'history'>('live');

  const selectedRun = selectedAgent
    ? runs.find((r) => r.agent_name === selectedAgent) ?? null
    : null;

  const busyAgents = useMemo(
    () => new Set(runs.filter((r) => r.status === 'running').map((r) => r.agent_name)),
    [runs],
  );

  // In history mode, light up every station that has ever run instead of only live ones.
  const litAgents = useMemo(() => {
    if (ringMode === 'live') return busyAgents;
    return new Set(runs.map((r) => r.agent_name));
  }, [ringMode, busyAgents, runs]);

  const busyChips = useMemo(() => {
    const chips: Array<{ label: string; hot: boolean }> = [];
    for (const name of busyAgents) {
      const meta = AGENT_REGISTRY[name as AgentKey];
      chips.push({ label: `${meta?.label ?? name} - running`, hot: true });
    }
    const idle = AGENT_KEYS.length - busyAgents.size;
    chips.push({ label: `${idle} idle`, hot: false });
    return chips;
  }, [busyAgents]);

  return (
    <div>
      <ReadoutStrip runs={runs} />

      <div className="deck-grid">
        <div className="hero-ring">
          <div className="hd">
            <div className="htitle">
              <Radio size={16} />
              <h3>Orbit ring</h3>
              <span className="tag">{AGENT_KEYS.length} stations</span>
            </div>
            <div className="view-toggle">
              {(['live', 'history'] as const).map((mode) => (
                <button
                  key={mode}
                  className={ringMode === mode ? 'on' : ''}
                  onClick={() => setRingMode(mode)}
                >
                  {mode === 'live' ? 'Live' : 'History'}
                </button>
              ))}
            </div>
          </div>

          <div className="ring-stage">
            <OrbitRing busyAgents={litAgents} onSelectAgent={setSelectedAgent} />
          </div>

          <div className="station-legend">
            {busyChips.map((chip) => (
              <span key={chip.label} className={`station-chip${chip.hot ? ' hot' : ''}`}>
                <span className="d" />
                {chip.label}
              </span>
            ))}
          </div>

          <div className="legend-strip">
            <span className="li">
              <span className="sw" style={{ background: 'var(--orbit-cyan)' }} /> dev-loop handoffs
            </span>
            <span className="li">
              <span className="sw" style={{ background: 'var(--violet)' }} /> everyday-task handoffs
            </span>
            <span className="li">
              <span className="dot" style={{ background: 'var(--signal)' }} /> currently running
            </span>
          </div>
        </div>

        <div className="side-rail">
          <ConversationPanel
            latestToolCalls={toolCalls.filter((c) => c.status === 'running')}
            onDispatch={() => {}}
          />
          <PermissionPanel />
        </div>

        <TraceRibbon toolCalls={toolCalls} />
      </div>

      <RunInspector run={selectedRun} onClose={() => setSelectedAgent(null)} />
    </div>
  );
}
