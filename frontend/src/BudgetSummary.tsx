// Three stat cards showing spent, budget, and remaining for the current month
import type { Summary } from "./useExpenses";

type BudgetSummaryProps = { summary: Summary };

export function BudgetSummary({ summary }: BudgetSummaryProps) {
  const cards = [
    { label: "Spent this month", value: summary.spent, tone: "text-red-400" },
    { label: "Budget", value: summary.budget, tone: "text-neutral-200" },
    { label: "Remaining", value: summary.remaining, tone: "text-green-400" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.tone}`}>
            {card.value.toLocaleString("en-IN")} INR
          </p>
        </div>
      ))}
    </div>
  );
}
