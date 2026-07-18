// Slide-in detail panel showing a single run's request, result, tokens, cost, and tool-call trace
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { AGENT_REGISTRY, type AgentKey } from './agentRegistry';
import type { AgentRun } from './useAgentRuns';

interface ToolCall {
  id: number;
  tool_name: string;
  input: string | null;
  output: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
}

interface RunInspectorProps {
  run: AgentRun | null;
  onClose: () => void;
}

export function RunInspector({ run, onClose }: RunInspectorProps) {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  useEffect(() => {
    if (!run) return;
    fetch(`/agents/runs/${run.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((detail) => setToolCalls(detail?.tool_calls ?? []))
      .catch(() => setToolCalls([]));
  }, [run?.id]);

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {AGENT_REGISTRY[run.agent_name as AgentKey]?.label ?? run.agent_name}
                </h2>
                <p className="text-xs text-slate-500">{new Date(run.started_at).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>

            <div className="mt-4">
              <Badge
                variant={run.status === 'success' ? 'success' : run.status === 'error' ? 'danger' : 'info'}
              >
                {run.status}
              </Badge>
            </div>

            <section className="mt-4">
              <h3 className="text-xs font-semibold uppercase text-slate-400">Request</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap">{run.request}</p>
            </section>

            {run.result && (
              <section className="mt-4">
                <h3 className="text-xs font-semibold uppercase text-slate-400">Result</h3>
                <p className="mt-1 text-sm whitespace-pre-wrap">{run.result}</p>
              </section>
            )}

            <section className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Tokens</p>
                <p>{run.tokens_total ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Model</p>
                <p>{run.model ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cost (USD)</p>
                <p>{run.cost_usd != null ? `$${run.cost_usd.toFixed(4)}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cost (INR)</p>
                <p>{run.cost_inr != null ? `₹${run.cost_inr.toFixed(4)}` : '—'}</p>
              </div>
            </section>

            {toolCalls.length > 0 && (
              <section className="mt-4">
                <h3 className="text-xs font-semibold uppercase text-slate-400">Tool calls</h3>
                <ul className="mt-2 space-y-2">
                  {toolCalls.map((call) => (
                    <li
                      key={call.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{call.tool_name}</span>
                        <Badge size="sm" variant={call.status === 'success' ? 'success' : 'danger'}>
                          {call.status}
                        </Badge>
                      </div>
                      {call.input && <p className="mt-1 text-slate-500">in: {call.input}</p>}
                      {call.output && <p className="mt-1 text-slate-500">out: {call.output}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
