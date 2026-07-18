// Monthly budget overview: month name, usage bar, and spent, budget, remaining stats
import type { Summary } from "./useExpenses";

type BudgetSummaryProps = { summary: Summary };

export function BudgetSummary({ summary }: BudgetSummaryProps) {
  const percent = Math.min(100, Math.round((summary.spent / summary.budget) * 100));
  const barColor = percent < 70 ? 'var(--color-signal)' : percent < 100 ? 'var(--color-warning)' : 'var(--color-danger)';
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const stats = [
    { label: 'Spent', value: summary.spent, tone: 'var(--color-text-primary)' },
    { label: 'Budget', value: summary.budget, tone: 'var(--color-text-tertiary)' },
    { label: 'Remaining', value: summary.remaining, tone: summary.remaining >= 0 ? 'var(--color-signal)' : 'var(--color-danger)' },
  ];
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {month}
        </h2>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {percent}% of budget used
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-surface-raised)' }}>
        <div className="h-full" style={{ width: `${percent}%`, background: barColor }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {stat.label}
            </p>
            <p className="mt-0.5 text-xl font-semibold" style={{ color: stat.tone }}>
              {stat.value.toLocaleString('en-IN')}
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
                INR
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
