// Top-level dashboard layout: header, backend status, tab bar, and the active tab
import { useState, type ComponentType } from "react";
import { BackendStatus } from "./BackendStatus";
import { TABS, TabBar, type TabName } from "./TabBar";
import { JobsTab } from "./tabs/JobsTab";
import { MoneyTab } from "./tabs/MoneyTab";
import { OrchestrationTab } from "./tabs/OrchestrationTab";
import { ProgressTab } from "./tabs/ProgressTab";
import { ResumeTab } from "./tabs/ResumeTab";
import { TodayTab } from "./tabs/TodayTab";

const TAB_CONTENT: Record<TabName, ComponentType> = {
  Today: TodayTab,
  Progress: ProgressTab,
  Money: MoneyTab,
  Jobs: JobsTab,
  Resume: ResumeTab,
  Orchestration: OrchestrationTab,
};

export function OrbitApp() {
  const [active, setActive] = useState<TabName>("Today");
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Project Orbit</h1>
        <BackendStatus />
      </header>
      <TabBar active={active} onSelect={setActive} />
      <main className="mx-auto max-w-5xl p-6">
        {TABS.map((name) => {
          const Tab = TAB_CONTENT[name];
          return (
            <div key={name} className={name === active ? "" : "hidden"}>
              <Tab />
            </div>
          );
        })}
      </main>
    </div>
  );
}
