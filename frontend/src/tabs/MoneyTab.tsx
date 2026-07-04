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
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div className="space-y-10" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Expenses</h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Track spending against your ₹75,000 monthly budget</p>
      </motion.div>

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
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add an expense</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Log a new expense by typing naturally</p>
        </div>
        <ExpenseForm onSaved={reload} knownCategories={[...new Set(expenses.map((e) => e.category))]} />
      </motion.section>

      {/* Search */}
      <motion.section variants={itemVariants}>
        <div className="mb-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Filter expenses</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Search by note or category</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchBar placeholder="Search by note..." onSearch={onSearch} />
          </div>
          <div className="w-48">
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                search('', event.target.value);
              }}
              className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
      </motion.section>

      {/* Expense list */}
      <motion.section variants={itemVariants}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Recent expenses</h3>
        {expenses.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <Wallet className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No expenses logged yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
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
