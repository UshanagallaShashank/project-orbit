import { motion } from 'framer-motion';

export const TABS = ['Today', 'Progress', 'Money', 'Jobs', 'Resume', 'Orchestration'] as const;
export type TabName = (typeof TABS)[number];

type TabBarProps = { active: TabName; onSelect: (tab: TabName) => void };

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="sticky top-16 z-30 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => onSelect(tab)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-colors
                ${
                  tab === active
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab}
              {tab === active && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
