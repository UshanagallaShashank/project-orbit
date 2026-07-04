import { motion } from 'framer-motion';

export const TABS = ['Today', 'Progress', 'Money', 'Jobs', 'Resume', 'Orchestration'] as const;
export type TabName = (typeof TABS)[number];

type TabBarProps = { active: TabName; onSelect: (tab: TabName) => void };

const tabIcons: Record<TabName, string> = {
  Today: '📅',
  Progress: '📈',
  Money: '💰',
  Jobs: '💼',
  Resume: '📄',
  Orchestration: '⚙️',
};

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="sticky top-[69px] z-30 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => onSelect(tab)}
              className={`
                relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors
                ${
                  tab === active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-400'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="inline-block mr-1.5">{tabIcons[tab]}</span>
              {tab}
              {tab === active && (
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
