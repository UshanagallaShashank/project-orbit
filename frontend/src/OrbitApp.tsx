import { useState, type ComponentType, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const t = stored || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Project Orbit
            </h1>
          </motion.div>
          <BackendStatus />
        </div>
      </header>

      <TabBar active={active} onSelect={setActive} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {TABS.map((name) => {
          const Tab = TAB_CONTENT[name];
          return (
            <motion.div
              key={name}
              initial={name !== active ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={name === active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={name === active ? 'block' : 'hidden'}
            >
              <Tab />
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
