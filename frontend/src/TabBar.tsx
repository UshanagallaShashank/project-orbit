export const TABS = ['Today', 'Progress', 'Money', 'Jobs', 'Resume', 'Orchestration'] as const;
export type TabName = (typeof TABS)[number];

type TabBarProps = { active: TabName; onSelect: (tab: TabName) => void };

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              tab === active
                ? 'border-green-600 text-green-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
