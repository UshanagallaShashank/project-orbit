// Horizontally-scrolling row of the latest run's tool calls: agent, input, output, status -
// the literal "what tool did it call and what did it return" view, lucide icons per agent.
import { ArrowRight, Box, Brain, Clock, Pencil, Terminal, Wallet } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ToolCall } from './useToolTrace';

const AGENT_ICONS: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  feature: Pencil,
  sandbox: Box,
  expense: Wallet,
  memory: Brain,
  cost: Clock,
};

function truncate(text: string | null, max = 46): string {
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function TraceRibbon({ toolCalls }: { toolCalls: ToolCall[] }) {
  return (
    <div
      className="flex min-h-0 flex-col rounded-2xl border p-5"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-[15px] font-semibold">Tool trace</h3>
        <span className="font-mono text-[10px] uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
          agent_tool_calls, scroll →
        </span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {toolCalls.length === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            No calls yet this run — send a request in the conversation panel to see the trace.
          </p>
        )}
        {toolCalls.map((call, i) => {
          const Icon = AGENT_ICONS[call.tool_name] ?? Terminal;
          return (
            <div key={call.id} className="flex items-center gap-3">
              <div
                className="w-[230px] flex-shrink-0 rounded-xl border p-3 transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--color-surface-raised)', borderColor: 'var(--color-border)' }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    <Icon size={13} color="var(--color-orbit-cyan)" />
                    {call.tool_name}.run
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wide"
                    style={{
                      background: call.status === 'success' ? 'var(--color-success-soft)' : 'var(--color-signal-soft)',
                      color: call.status === 'success' ? 'var(--color-success)' : 'var(--color-signal)',
                    }}
                  >
                    {call.status}
                  </span>
                </div>
                <div className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>in</span> {truncate(call.input)}
                  {call.output && (
                    <>
                      <br />
                      <span style={{ color: 'var(--color-text-tertiary)' }}>out</span> {truncate(call.output)}
                    </>
                  )}
                </div>
              </div>
              {i < toolCalls.length - 1 && <ArrowRight size={18} color="var(--color-text-tertiary)" className="flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
