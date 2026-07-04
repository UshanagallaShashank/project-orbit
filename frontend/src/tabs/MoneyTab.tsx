// Money tab: monthly budget overview, category breakdown, entry form, and recent expenses
import { BudgetSummary } from "../BudgetSummary";
import { CategoryBreakdown } from "../CategoryBreakdown";
import { EmptyState } from "../EmptyState";
import { ExpenseForm } from "../ExpenseForm";
import { ExpenseList } from "../ExpenseList";
import { useExpenses } from "../useExpenses";

export function MoneyTab() {
  const { expenses, summary, reload } = useExpenses();
  return (
    <div className="flex flex-col gap-6">
      {summary && <BudgetSummary summary={summary} />}
      {expenses.length > 0 && <CategoryBreakdown expenses={expenses} />}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Add an expense</h2>
        <ExpenseForm onSaved={reload} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Recent expenses</h2>
        {expenses.length === 0 ? (
          <EmptyState
            title="No expenses logged yet"
            hint="Add your first expense above. Voice logging via Deepgram arrives later in phase 3."
          />
        ) : (
          <ExpenseList expenses={expenses} />
        )}
      </section>
    </div>
  );
}
