// Recent expenses list with amount, category, note, date, and a delete action
import type { Expense } from "./useExpenses";

type ExpenseListProps = { expenses: Expense[]; onDelete: (id: number) => void };

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col">
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {expense.note || expense.category}
            </span>
            <span className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>
              {expense.category} -{' '}
              {new Date(expense.created_at).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
              -{expense.amount.toLocaleString('en-IN')} INR
            </span>
            <button
              onClick={() => onDelete(expense.id)}
              className="rounded-lg px-2 py-1 text-xs transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
