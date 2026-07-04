// Hook that loads expenses and the monthly summary from the backend every five seconds
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
  useEffect(() => {
    reload();
    const timer = setInterval(reload, 5000);
    return () => clearInterval(timer);
  }, [reload]);
  return { expenses, summary, reload };
}
