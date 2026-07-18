// Chat surface that dispatches through /agents/run (auto-routing, no agent picked by hand) and
// renders each delegated agent call inline, sourced from the run's tool trace.
import { ArrowRight, Check, MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ToolCall } from './useToolTrace';

interface ChatEntry {
  id: string;
  kind: 'user' | 'orbit';
  text: string;
}

interface ConversationPanelProps {
  latestToolCalls: ToolCall[];
  onDispatch: () => void;
}

export function ConversationPanel({ latestToolCalls, onDispatch }: ConversationPanelProps) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  const submit = async () => {
    const request = text.trim();
    if (!request) return;
    setLoading(true);
    setError(null);
    setEntries((prev) => [...prev, { id: `u-${Date.now()}`, kind: 'user', text: request }]);
    setText('');
    try {
      const res = await fetch('/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_name: 'auto', request }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Request failed (${res.status})`);
      }
      const body = await res.json();
      setEntries((prev) => [...prev, { id: `o-${Date.now()}`, kind: 'orbit', text: body.result }]);
      onDispatch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden rounded-2xl border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3.5" style={{ borderColor: 'var(--color-border)' }}>
        <MessageSquare size={15} color="var(--color-text-tertiary)" />
        <h3 className="font-display text-[14px] font-semibold">Conversation</h3>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3">
        {entries.length === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Tell Orbit what you need — it decides which agents to call, in what order, without you naming one.
          </p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', justifyContent: entry.kind === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              className="rounded-xl px-3 py-2 text-[12px] leading-relaxed"
              style={{
                maxWidth: '78%',
                ...(entry.kind === 'user'
                  ? { background: 'var(--color-text-primary)', color: 'var(--color-surface)' }
                  : { background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }),
              }}
            >
              {entry.text}
            </div>
          </div>
        ))}
        {loading && latestToolCalls.length > 0 && (
          <div
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10.5px]"
            style={{ background: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
          >
            <ArrowRight size={12} color="var(--color-orbit-cyan)" />
            {latestToolCalls.map((c, i) => (
              <span key={c.id}>
                <b className="font-mono" style={{ color: 'var(--color-orbit-cyan)' }}>
                  {c.tool_name}
                </b>
                {i < latestToolCalls.length - 1 && ' → '}
              </span>
            ))}
            <Check size={12} color="var(--color-success)" style={{ marginLeft: 'auto' }} />
          </div>
        )}
        {error && (
          <p className="text-[11px]" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-colors focus-within:border-current"
          style={{ background: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'var(--color-signal)' }}
        >
          <ArrowRight size={13} color="var(--color-signal)" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submit();
            }}
            placeholder="tell Orbit what you need…"
            className="flex-1 bg-transparent font-mono text-[12px] outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
        <button
          onClick={() => void submit()}
          disabled={loading || !text.trim()}
          aria-label="Send"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
