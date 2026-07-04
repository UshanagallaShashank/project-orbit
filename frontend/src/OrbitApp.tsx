import { useState, type ComponentType } from 'react';
import { BackendStatus } from './BackendStatus';
import { TABS, TabBar, type TabName } from './TabBar';
import { JobsTab } from './tabs/JobsTab';
import { MoneyTab } from './tabs/MoneyTab';
import { OrchestrationTab } from './tabs/OrchestrationTab';
import { ProgressTab } from './tabs/ProgressTab';
import { ResumeTab } from './tabs/ResumeTab';
import { TodayTab } from './tabs/TodayTab';

const TAB_CONTENT: Record<TabName, ComponentType> = {
  Today: TodayTab,
  Progress: ProgressTab,
  Money: MoneyTab,
  Jobs: JobsTab,
  Resume: ResumeTab,
  Orchestration: OrchestrationTab,
};

export function OrbitApp() {
  const [active, setActive] = useState<TabName>('Today');

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Orbit</h1>
          <BackendStatus />
        </div>
      </header>

      <TabBar active={active} onSelect={setActive} />

      <main className="max-w-7xl mx-auto px-8 py-6">
        {TABS.map((name) => {
          const Tab = TAB_CONTENT[name];
          return (
            <div key={name} className={name === active ? 'block' : 'hidden'}>
              <Tab />
            </div>
          );
        })}
      </main>
    </div>
  );
}
