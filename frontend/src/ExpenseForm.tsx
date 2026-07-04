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

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 p-4">
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Amount (INR)
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-32 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="250"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Category (pick or type a new one)
        <input
          list="category-options"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-52 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="food, ai tools, anything"
        />
      </label>
      <datalist id="category-options">
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <label className="flex grow flex-col gap-1 text-xs text-neutral-400">
        Note
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          placeholder="lunch at the mess"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add expense"}
      </button>
    </form>
  );
}
