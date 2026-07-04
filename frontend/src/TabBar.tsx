// Horizontal tab bar that switches between the six dashboard sections
export const TABS = ["Today", "Progress", "Money", "Jobs", "Resume", "Orchestration"] as const;
export type TabName = (typeof TABS)[number];

type TabBarProps = { active: TabName; onSelect: (tab: TabName) => void };

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-neutral-800 px-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={
            tab === active
              ? "border-b-2 border-green-500 px-3 py-3 text-sm font-medium text-white"
              : "border-b-2 border-transparent px-3 py-3 text-sm text-neutral-400 hover:text-white"
          }
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
