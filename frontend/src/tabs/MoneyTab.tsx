// Money tab: monthly budget overview, category breakdown, search, entry form, and expense list
import { useCallback, useState } from "react";
import { BudgetSummary } from "../BudgetSummary";
import { CategoryBreakdown } from "../CategoryBreakdown";
import { EmptyState } from "../EmptyState";
import { ExpenseForm } from "../ExpenseForm";
import { ExpenseList } from "../ExpenseList";
import { SearchBar } from "../SearchBar";
import { useExpenses } from "../useExpenses";

export function MoneyTab() {
  const { expenses, summary, reload, search, remove } = useExpenses();
  const [category, setCategory] = useState("");
  const onSearch = useCallback((query: string) => search(query, category), [search, category]);

  return (
    <div className="flex flex-col gap-6">
      {summary && <BudgetSummary summary={summary} />}
      {expenses.length > 0 && <CategoryBreakdown expenses={expenses} />}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Add an expense</h2>
        <ExpenseForm onSaved={reload} knownCategories={[...new Set(expenses.map((e) => e.category))]} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Search expenses</h2>
        <SearchBar placeholder="Search by note..." onSearch={onSearch}>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              search("", event.target.value);
            }}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          >
            <option value="">All categories</option>
            {[...new Set(expenses.map((e) => e.category))].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </SearchBar>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-200">Recent expenses</h2>
        {expenses.length === 0 ? (
          <EmptyState
            title="No expenses logged yet"
            hint="Add your first expense above. Voice logging via Deepgram arrives later."
          />
        ) : (
          <ExpenseList expenses={expenses} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
