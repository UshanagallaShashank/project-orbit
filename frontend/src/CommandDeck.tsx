// The Command Deck: page header, readout strip, an @xyflow/react agent graph as the dominant
// left element, a stacked right rail (conversation over permissions), and a tool-trace ribbon
// under the graph.
import { Bell, Plus, Radio } from 'lucide-react';
import { useState } from 'react';
import { AGENT_KEYS, type AgentKey } from './agentRegistry';
import { AgentGraph } from './AgentGraph';
import { ConversationPanel } from './ConversationPanel';
import { PermissionPanel } from './PermissionPanel';
import { ReadoutStrip } from './ReadoutStrip';
import { RunInspector } from './RunInspector';
import { StageHeader } from './StageHeader';
import { TraceRibbon } from './TraceRibbon';
import { useAgentRuns } from './useAgentRuns';
import { useToolTrace } from './useToolTrace';

function iconButtonStyle() {
  return {
    background: 'var(--color-surface-raised)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-secondary)',
  };
}

export function CommandDeck() {
  const { runs } = useAgentRuns();
  const { toolCalls } = useToolTrace(runs);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey | null>(null);

  const selectedRun = selectedAgent ? runs.find((r) => r.agent_name === selectedAgent) ?? null : null;
  const activeCount = new Set(runs.filter((r) => r.status === 'running').map((r) => r.agent_name)).size;

  return (
    <div>
      <StageHeader
        title="Command Deck"
        crumb="orbit / deck / live"
        actions={
          <>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:brightness-125" style={iconButtonStyle()} aria-label="Add">
              <Plus size={16} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:brightness-125" style={iconButtonStyle()} aria-label="Notifications">
              <Bell size={16} />
            </button>
            <span
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'var(--color-surface)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeCount > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
              {activeCount} agent{activeCount === 1 ? '' : 's'} active
            </span>
          </>
        }
      />

      <div className="grid grid-cols-[1.3fr_1fr] grid-rows-[auto_620px_auto] gap-4">
        <ReadoutStrip runs={runs} />

        <div
          className="relative col-start-1 row-start-2 flex flex-col overflow-hidden rounded-2xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2.5">
              <Radio size={17} color="var(--color-signal)" />
              <h3 className="font-display text-[16px] font-semibold">Agent graph</h3>
              <span className="font-mono text-[10px] uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
                {AGENT_KEYS.length} agents · drag to pan · scroll to zoom
              </span>
            </div>
            <span
              className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase"
              style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-secondary)' }}
            >
              Live
            </span>
          </div>

          <div className="min-h-0 flex-1">
            <AgentGraph runs={runs} onSelectAgent={setSelectedAgent} />
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t px-5 py-3 text-[11.5px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: 'var(--color-orbit-cyan)' }} /> dev-loop handoffs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: 'var(--color-violet)' }} /> everyday-task handoffs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-signal)' }} /> currently running
            </span>
          </div>
        </div>

        <div className="col-start-2 row-start-2 row-span-2 flex min-h-0 flex-col gap-4">
          <div className="flex min-h-0 flex-[2] flex-col">
            <ConversationPanel latestToolCalls={toolCalls.filter((c) => c.status === 'running')} onDispatch={() => {}} />
          </div>
          <div className="flex-1">
            <PermissionPanel />
          </div>
        </div>

        <div className="col-start-1 row-start-3 min-h-0">
          <TraceRibbon toolCalls={toolCalls} />
        </div>
      </div>

      <RunInspector run={selectedRun} onClose={() => setSelectedAgent(null)} />
    </div>
  );
}
