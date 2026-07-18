// Polls the most recent run's detail endpoint to surface its tool-call trace (agent, input,
// output, status) for the Command Deck's trace ribbon - this is the "what tool did it call and
// what did it return" view, sourced from the same agent_tool_calls rows the backend persists.
import { useEffect, useState } from 'react';
import type { AgentRun } from './useAgentRuns';

export interface ToolCall {
  id: number;
  run_id: number;
  tool_name: string;
  input: string | null;
  output: string | null;
  status: 'running' | 'success' | 'error';
  started_at: string;
  finished_at: string | null;
}

export function useToolTrace(runs: AgentRun[]) {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const latestRunId = runs[0]?.id;

  useEffect(() => {
    if (latestRunId == null) return;
    const load = () =>
      fetch(`/agents/runs/${latestRunId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((detail) => setToolCalls(detail?.tool_calls ?? []))
        .catch(() => {});
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [latestRunId]);

  return { toolCalls };
}
