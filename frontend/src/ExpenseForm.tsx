// Manual expense entry form that posts to the backend and refreshes the list
import { useState, type FormEvent } from "react";

const CATEGORIES = ["food", "transport", "rent", "shopping", "health", "entertainment", "other"];

type ExpenseFormProps = { onSaved: () => void };

export function ExpenseForm({ onSaved }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    await fetch("/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), category, note }),
    }).catch(() => null);
    setSaving(false);
    setAmount("");
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
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        >
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
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
