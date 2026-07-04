// Monthly budget overview: month name, usage bar, and spent, budget, remaining stats
import type { Summary } from "./useExpenses";

type BudgetSummaryProps = { summary: Summary };

export function BudgetSummary({ summary }: BudgetSummaryProps) {
  const percent = Math.min(100, Math.round((summary.spent / summary.budget) * 100));
  const barColor = percent < 70 ? "bg-green-500" : percent < 100 ? "bg-yellow-500" : "bg-red-500";
  const month = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const stats = [
    { label: "Spent", value: summary.spent, tone: "text-neutral-100" },
    { label: "Budget", value: summary.budget, tone: "text-neutral-400" },
    { label: "Remaining", value: summary.remaining, tone: summary.remaining >= 0 ? "text-green-400" : "text-red-400" },
  ];
  return (
    <section className="rounded-xl border border-neutral-800 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">{month}</h2>
        <span className="text-xs text-neutral-500">{percent}% of budget used</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
        <div className={`h-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xs text-neutral-500">{stat.label}</p>
            <p className={`mt-0.5 text-xl font-semibold ${stat.tone}`}>
              {stat.value.toLocaleString("en-IN")}
              <span className="ml-1 text-xs font-normal text-neutral-500">INR</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
