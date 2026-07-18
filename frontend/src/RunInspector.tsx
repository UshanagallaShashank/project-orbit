// Slide-in detail panel showing a single run's request, result, tokens, cost, and tool trace.
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AGENT_REGISTRY, type AgentKey } from './agentRegistry';
import type { AgentRun } from './useAgentRuns';
import type { ToolCall } from './useToolTrace';

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

  const badgeClass = (status: string) =>
    status === 'success' ? 'ok' : status === 'error' ? 'crit' : 'warn';

  return (
    <AnimatePresence>
      {run && (
        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>{AGENT_REGISTRY[run.agent_name as AgentKey]?.label ?? run.agent_name}</h2>
                <div className="sub">{new Date(run.started_at).toLocaleString()}</div>
              </div>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <section>
              <span className={`badge ${badgeClass(run.status)}`}>{run.status}</span>
            </section>

            <section>
              <div className="sec-label">Request</div>
              <div className="sec-body">{run.request}</div>
            </section>

            {run.result && (
              <section>
                <div className="sec-label">Result</div>
                <div className="sec-body">{run.result}</div>
              </section>
            )}

            <section className="grid-2">
              <div className="kv">
                <div className="k">Tokens</div>
                <div className="v">{run.tokens_total ?? '-'}</div>
              </div>
              <div className="kv">
                <div className="k">Model</div>
                <div className="v" style={{ fontSize: 11 }}>{run.model ?? '-'}</div>
              </div>
              <div className="kv">
                <div className="k">Cost (USD)</div>
                <div className="v">{run.cost_usd != null ? `$${run.cost_usd.toFixed(4)}` : '-'}</div>
              </div>
              <div className="kv">
                <div className="k">Cost (INR)</div>
                <div className="v">{run.cost_inr != null ? run.cost_inr.toFixed(4) : '-'}</div>
              </div>
            </section>

            {toolCalls.length > 0 && (
              <section>
                <div className="sec-label">Tool calls</div>
                {toolCalls.map((call) => (
                  <div key={call.id} className="tool-call-item">
                    <div className="tch">
                      <span className="tname">{call.tool_name}</span>
                      <span className={`badge ${badgeClass(call.status)}`}>{call.status}</span>
                    </div>
                    <div className="tio">
                      {call.input && (
                        <div>
                          <span className="k">in </span>
                          {call.input}
                        </div>
                      )}
                      {call.output && (
                        <div>
                          <span className="k">out </span>
                          {call.output}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
