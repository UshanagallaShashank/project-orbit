// Form to save a new resume version with a label and full text content
import { useState, type FormEvent } from "react";

type ResumeVersionFormProps = { onSaved: () => void };

export function ResumeVersionForm({ onSaved }: ResumeVersionFormProps) {
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim() || !content.trim()) return;
    setSaving(true);
    await fetch("/resume/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, content }),
    }).catch(() => null);
    setSaving(false);
    setLabel("");
    setContent("");
    onSaved();
  };

  const fieldStyle = { borderColor: 'var(--color-border)', background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' };
  const labelStyle = { color: 'var(--color-text-tertiary)' };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <label className="flex flex-col gap-1 text-xs" style={labelStyle}>
        Version label
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="v3 - SDE roles"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs" style={labelStyle}>
        Content
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          className="rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="Paste the resume text for this version..."
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
      >
        {saving ? 'Saving...' : 'Save version'}
      </button>
    </form>
  );
}
