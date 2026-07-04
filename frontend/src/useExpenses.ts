// Hook that loads, searches, saves, edits, and deletes expenses, plus the monthly summary
import { useCallback, useEffect, useState } from "react";

export type Expense = { id: number; amount: number; category: string; note: string; created_at: string };
export type Summary = { spent: number; budget: number; remaining: number };

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const reload = useCallback(() => {
    fetch("/expenses")
      .then((response) => (response.ok ? response.json() : []))
      .then(setExpenses)
      .catch(() => setExpenses([]));
    fetch("/expenses/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const search = useCallback((query: string, category: string) => {
    const params = new URLSearchParams({ q: query, category });
    fetch(`/expenses/search?${params}`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setExpenses)
      .catch(() => setExpenses([]));
  }, []);

  const remove = useCallback(
    async (id: number) => {
      await fetch(`/expenses/${id}`, { method: "DELETE" }).catch(() => null);
      reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { expenses, summary, reload, search, remove };
}
