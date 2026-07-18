// Per-category spending bars so the biggest expense areas stand out at a glance
import type { Expense } from "./useExpenses";

type CategoryBreakdownProps = { expenses: Expense[] };

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + Number(expense.amount));
  }
  const entries = [...totals.entries()].sort((first, second) => second[1] - first[1]);
  const largest = entries[0]?.[1] ?? 1;
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Where the money went
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {entries.map(([category, total]) => (
          <div key={category} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
              {category}
            </span>
            <div className="h-2 grow overflow-hidden rounded-full" style={{ background: 'var(--color-surface-raised)' }}>
              <div className="h-full rounded-full" style={{ width: `${(total / largest) * 100}%`, background: 'var(--color-signal)' }} />
            </div>
            <span className="w-24 shrink-0 text-right text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {total.toLocaleString('en-IN')} INR
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
