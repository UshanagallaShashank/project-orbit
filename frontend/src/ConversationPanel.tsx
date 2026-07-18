// Chat surface that dispatches through /agents/run (auto-routing, no agent picked by hand)
// and renders each delegated agent call inline, sourced from the run's tool trace.
import { ChevronRight, MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ToolCall } from './useToolTrace';

interface ChatEntry {
  id: string;
  kind: 'user' | 'orbit' | 'error';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const submit = async () => {
    const request = text.trim();
    if (!request || loading) return;

    setLoading(true);
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
      setEntries((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, kind: 'error', text: err instanceof Error ? err.message : 'Request failed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries, latestToolCalls, loading]);

  return (
    <div className="conv-panel">
      <div className="panel-head">
        <MessageSquare size={14} style={{ color: 'var(--ink-faint)' }} />
        <h3>Conversation</h3>
      </div>

      <div ref={scrollRef} className="conv-scroll">
        {entries.length === 0 && (
          <div className="conv-hint">
            Tell Orbit what you need - it decides which agents to call, in what order, without you
            naming one. Try "spent 250 on lunch" or "log 2 hours of DSA".
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className={`msg ${entry.kind === 'user' ? 'user' : entry.kind === 'error' ? 'error orbit' : 'orbit'}`}>
            <div className="av">{entry.kind === 'user' ? 'U' : 'O'}</div>
            <div className="bubble">{entry.text}</div>
          </div>
        ))}

        {loading && (
          <div className="agent-inline">
            <ChevronRight size={11} />
            {latestToolCalls.length > 0 ? (
              <span>
                Dispatched{' '}
                {latestToolCalls.map((call, i) => (
                  <span key={call.id}>
                    {i > 0 && ', '}
                    <b>{call.tool_name}</b>
                  </span>
                ))}
              </span>
            ) : (
              <span>Orbit is routing your request</span>
            )}
            <span className="spin" />
          </div>
        )}
      </div>

      <div className="conv-input">
        <div className="field">
          <ChevronRight size={12} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="tell Orbit what you need..."
            aria-label="Message Orbit"
          />
        </div>
        <button
          className="send-btn"
          onClick={() => void submit()}
          disabled={loading || !text.trim()}
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
