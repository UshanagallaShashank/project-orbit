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

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-neutral-800 p-4">
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Version label
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="v3 - SDE roles"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Content
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="Paste the resume text for this version..."
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save version"}
      </button>
    </form>
  );
}
