export const TABS = ['Today', 'Progress', 'Money', 'Jobs', 'Resume', 'Orchestration'] as const;
export type TabName = (typeof TABS)[number];

type TabBarProps = { active: TabName; onSelect: (tab: TabName) => void };

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              tab === active
                ? 'border-green-600 text-green-600 dark:text-green-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
