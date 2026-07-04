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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                Orbit
              </span>
            </h1>
          </motion.div>
          <BackendStatus />
        </div>
      </header>

      <TabBar active={active} onSelect={setActive} />

      <main className="mx-auto max-w-6xl px-8 py-10">
        {TABS.map((name) => {
          const Tab = TAB_CONTENT[name];
          return (
            <motion.div
              key={name}
              initial={name !== active ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={name === active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
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
