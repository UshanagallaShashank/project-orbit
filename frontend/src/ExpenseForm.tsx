// Manual expense entry form with custom categories, posts to the backend and refreshes
import { useState, type FormEvent } from "react";

const DEFAULT_CATEGORIES = ["food", "transport", "rent", "shopping", "health", "entertainment", "other"];

type ExpenseFormProps = { onSaved: () => void; knownCategories: string[] };

export function ExpenseForm({ onSaved, knownCategories }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const suggestions = [...new Set([...DEFAULT_CATEGORIES, ...knownCategories])].sort();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanCategory = category.trim().toLowerCase() || "other";
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    await fetch("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), category: cleanCategory, note }),
    }).catch(() => null);
    setSaving(false);
    setAmount("");
    setCategory("");
    setNote("");
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
        Amount (INR)
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-32 rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="250"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs" style={labelStyle}>
        Category (pick or type a new one)
        <input
          list="category-options"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-52 rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="food, ai tools, anything"
        />
      </label>
      <datalist id="category-options">
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <label className="flex grow flex-col gap-1 text-xs" style={labelStyle}>
        Note
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={fieldStyle}
          placeholder="lunch at the mess"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' }}
      >
        {saving ? 'Saving...' : 'Add expense'}
      </button>
    </form>
  );
}
