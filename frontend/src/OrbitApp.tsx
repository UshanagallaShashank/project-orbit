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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orbit</h1>
          <BackendStatus />
        </div>
      </header>

      <TabBar active={active} onSelect={setActive} />

      <main className="max-w-6xl mx-auto px-6 py-8">
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
