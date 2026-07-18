import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { BudgetSummary } from '../BudgetSummary';
import { CategoryBreakdown } from '../CategoryBreakdown';
import { ExpenseForm } from '../ExpenseForm';
import { ExpenseList } from '../ExpenseList';
import { SearchBar } from '../SearchBar';
import { useExpenses } from '../useExpenses';
import { Card } from '../components/Card';
import { Wallet } from 'lucide-react';

export function MoneyTab() {
  const { expenses, summary, reload, search, remove } = useExpenses();
  const [category, setCategory] = useState('');
  const onSearch = useCallback((query: string) => search(query, category), [search, category]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Expenses</h2>
        <p className="text-slate-600 dark:text-slate-400">Track your spending against your budget</p>
      </div>

      {/* Budget summary */}
      {summary && (
        <motion.div variants={itemVariants}>
          <BudgetSummary summary={summary} />
        </motion.div>
      )}

      {/* Category breakdown */}
      {expenses.length > 0 && (
        <motion.div variants={itemVariants}>
          <CategoryBreakdown expenses={expenses} />
        </motion.div>
      )}

      {/* Add expense form */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add an expense</h3>
        <ExpenseForm onSaved={reload} knownCategories={[...new Set(expenses.map((e) => e.category))]} />
      </motion.section>

      {/* Search */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Search expenses</h3>
        <SearchBar placeholder="Search by note..." onSearch={onSearch}>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              search('', event.target.value);
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All categories</option>
            {[...new Set(expenses.map((e) => e.category))].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </SearchBar>
      </motion.section>

      {/* Expense list */}
      <motion.section variants={itemVariants}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent expenses</h3>
        {expenses.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900 mb-4">
              <Wallet className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No expenses logged yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Add your first expense above to start tracking your spending against your ₹75,000 monthly budget.
            </p>
          </Card>
        ) : (
          <ExpenseList expenses={expenses} onDelete={remove} />
        )}
      </motion.section>
    </motion.div>
  );
}
