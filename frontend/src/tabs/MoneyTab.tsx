import { useCallback, useState } from 'react';
import { BudgetSummary } from '../BudgetSummary';
import { CategoryBreakdown } from '../CategoryBreakdown';
import { ExpenseForm } from '../ExpenseForm';
import { ExpenseList } from '../ExpenseList';
import { SearchBar } from '../SearchBar';
import { useExpenses } from '../useExpenses';
import { Card } from '../components/Card';

export function MoneyTab() {
  const { expenses, summary, reload, search, remove } = useExpenses();
  const [category, setCategory] = useState('');
  const onSearch = useCallback((query: string) => search(query, category), [search, category]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Expenses</h2>
        <p className="text-gray-600">Track spending against your ₹75,000 monthly budget</p>
      </div>

      {summary && <BudgetSummary summary={summary} />}

      {expenses.length > 0 && <CategoryBreakdown expenses={expenses} />}

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add an expense</h3>
        <ExpenseForm onSaved={reload} knownCategories={[...new Set(expenses.map((e) => e.category))]} />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter expenses</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchBar placeholder="Search by note..." onSearch={onSearch} />
          </div>
          <div className="w-48">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                search('', e.target.value);
              }}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="">All categories</option>
              {[...new Set(expenses.map((e) => e.category))].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent expenses</h3>
        {expenses.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses logged yet</h3>
              <p className="text-gray-600">Add your first expense above to start tracking your spending.</p>
            </div>
          </Card>
        ) : (
          <ExpenseList expenses={expenses} onDelete={remove} />
        )}
      </section>
    </div>
  );
}
