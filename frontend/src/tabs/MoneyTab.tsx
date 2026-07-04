// Money tab: budget summary, expense entry form, and the recent expenses list
import { BudgetSummary } from "../BudgetSummary";
import { EmptyState } from "../EmptyState";
import { ExpenseForm } from "../ExpenseForm";
import { ExpenseList } from "../ExpenseList";
import { useExpenses } from "../useExpenses";

export function MoneyTab() {
  const { expenses, summary, reload } = useExpenses();
  return (
    <div className="flex flex-col gap-6">
      {summary && <BudgetSummary summary={summary} />}
      <ExpenseForm onSaved={reload} />
      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses logged yet"
          hint="Add your first expense above. Voice logging via Deepgram arrives later in phase 3."
        />
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  );
}
