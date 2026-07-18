// Subscribes to the backend's agent run history via SSE, falling back to none if the stream drops
import { useEffect, useRef, useState } from 'react';

export interface AgentRun {
  id: number;
  conversation_id: string;
  agent_name: string;
  request: string;
  status: 'running' | 'success' | 'error';
  result: string | null;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  tokens_total: number | null;
  cost_usd: number | null;
  cost_inr: number | null;
  model: string | null;
  started_at: string;
  finished_at: string | null;
}

export function useAgentRuns() {
  const [runs, setRuns] = useState<Record<number, AgentRun>>({});
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch('/agents/runs?limit=50')
      .then((res) => (res.ok ? res.json() : []))
      .then((initial: AgentRun[]) => {
        setRuns((prev) => {
          const next = { ...prev };
          for (const run of initial) next[run.id] = run;
          return next;
        });
      })
      .catch(() => {});

    const source = new EventSource('/agents/stream');
    sourceRef.current = source;
    source.onmessage = (event) => {
      try {
        const run: AgentRun = JSON.parse(event.data);
        setRuns((prev) => ({ ...prev, [run.id]: run }));
      } catch {
        // ignore malformed frames
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  const list = Object.values(runs).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );

  return { runs: list };
}
