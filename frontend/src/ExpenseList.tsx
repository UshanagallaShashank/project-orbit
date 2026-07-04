// Recent expenses list with amount, category, note, date, and a delete action
import type { Expense } from "./useExpenses";

type ExpenseListProps = { expenses: Expense[]; onDelete: (id: number) => void };

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red-400">
              -{expense.amount.toLocaleString("en-IN")} INR
            </span>
            <button
              onClick={() => onDelete(expense.id)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-red-950 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
