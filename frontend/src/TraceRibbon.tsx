// Horizontally-scrolling row of the latest run's tool calls: agent, input, output, status -
// the literal "what tool did it call and what did it return" view, lucide icons per agent.
import {
  ArrowRight,
  BookOpen,
  Box,
  Brain,
  Clock,
  FileText,
  Lightbulb,
  Mail,
  Pencil,
  Terminal,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { ToolCall } from './useToolTrace';

const AGENT_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  feature: Pencil,
  sandbox: Box,
  expense: Wallet,
  memory: Brain,
  cost: Clock,
  learning_tracker: BookOpen,
  resume: FileText,
  idea: Lightbulb,
  comms: Mail,
  qa: Terminal,
};

function iconFor(toolName: string): ComponentType<{ size?: number }> {
  const key = Object.keys(AGENT_ICONS).find((k) => toolName.includes(k));
  return key ? AGENT_ICONS[key] : Wrench;
}

function truncate(value: string | null, max = 60): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function TraceRibbon({ toolCalls }: { toolCalls: ToolCall[] }) {
  return (
    <div className="trace-ribbon">
      <div className="ph">
        <h3>Tool trace</h3>
        <span className="tag">agent_tool_calls, scroll</span>
      </div>
      {toolCalls.length === 0 ? (
        <p className="trace-empty">
          No calls yet this run - send a request in the conversation panel to see the trace.
        </p>
      ) : (
        <div className="trace-row-scroll">
          {toolCalls.map((call, i) => {
            const Icon = iconFor(call.tool_name);
            const statusClass =
              call.status === 'success' ? 'ok' : call.status === 'running' ? 'run' : 'err';
            return (
              <div key={call.id} style={{ display: 'contents' }}>
                {i > 0 && (
                  <div className="arrow-next">
                    <ArrowRight size={13} />
                  </div>
                )}
                <div className="trace-card">
                  <div className="th">
                    <span className="agent-tag">
                      <Icon size={12} />
                      <span className="tn">{call.tool_name}</span>
                    </span>
                    <span className={`stat-pill ${statusClass}`}>{call.status}</span>
                  </div>
                  <div className="io">
                    {call.input && (
                      <div>
                        <span className="k">in </span>
                        {truncate(call.input)}
                      </div>
                    )}
                    {call.output && (
                      <div>
                        <span className="k">out </span>
                        {truncate(call.output)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
