// Form to log a new study entry against a track (DSA, ML, AI, SysDesign)
import { useState, type FormEvent } from "react";

const TRACKS = ["dsa", "core_ml", "modern_ai", "sysdesign"];

type LearningEntryFormProps = { onSaved: () => void };

export function LearningEntryForm({ onSaved }: LearningEntryFormProps) {
  const [track, setTrack] = useState("dsa");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) return;
    setSaving(true);
    await fetch("/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track, topic, status: "in_progress" }),
    }).catch(() => null);
    setSaving(false);
    setTopic("");
    onSaved();
  };

  const fieldStyle = { borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' };
  const labelStyle = { color: 'var(--color-text-tertiary)' };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 rounded-2xl border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <label className="flex flex-col gap-1 text-xs" style={labelStyle}>
        Track
        <select value={track} onChange={(event) => setTrack(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={fieldStyle}>
          {TRACKS.map((name) => (
            <option key={name} value={name}>
              {name.replace('_', ' ')}
            </option>
          ))}
        </select>
      </label>
      <label className="flex grow flex-col gap-1 text-xs" style={labelStyle}>
        Topic
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="binary search trees"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
      >
        {saving ? 'Saving...' : 'Log topic'}
      </button>
    </form>
  );
}
