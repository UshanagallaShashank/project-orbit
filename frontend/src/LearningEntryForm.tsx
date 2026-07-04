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

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 p-4">
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Track
        <select
          value={track}
          onChange={(event) => setTrack(event.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          {TRACKS.map((name) => (
            <option key={name} value={name}>
              {name.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex grow flex-col gap-1 text-xs text-neutral-400">
        Topic
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="binary search trees"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Log topic"}
      </button>
    </form>
  );
}
