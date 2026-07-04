// Recent expenses list with amount, category, note, and date
import type { Expense } from "./useExpenses";

type ExpenseListProps = { expenses: Expense[] };

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 last:border-b-0"
        >
          <div className="flex flex-col">
            <span className="text-sm text-neutral-200">{expense.note || expense.category}</span>
            <span className="text-xs capitalize text-neutral-500">
              {expense.category} -{" "}
              {new Date(expense.created_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span className="text-sm font-medium text-red-400">
            -{expense.amount.toLocaleString("en-IN")} INR
          </span>
        </div>
      ))}
    </div>
  );
}
