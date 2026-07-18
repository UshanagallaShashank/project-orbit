// Personal tools consolidated into one page: Money, Resume, Jobs, Progress - not agent-facing,
// these are the everyday tabs from the original build, kept reachable via internal sub-nav.
import { useState, type ComponentType } from 'react';
import { JobsTab } from './tabs/JobsTab';
import { MoneyTab } from './tabs/MoneyTab';
import { ProgressTab } from './tabs/ProgressTab';
import { ResumeTab } from './tabs/ResumeTab';

const SECTIONS = ['Money', 'Resume', 'Jobs', 'Progress'] as const;
type Section = (typeof SECTIONS)[number];

const CONTENT: Record<Section, ComponentType> = {
  Money: MoneyTab,
  Resume: ResumeTab,
  Jobs: JobsTab,
  Progress: ProgressTab,
};

export function OpsPage() {
  const [active, setActive] = useState<Section>('Money');
  const Content = CONTENT[active];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Ops
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Personal tools, not agent-facing.
        </p>
      </div>
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActive(section)}
            className="relative px-3.5 py-2 text-[13px] font-medium transition-colors"
            style={{ color: active === section ? 'var(--color-signal)' : 'var(--color-text-secondary)' }}
          >
            {section}
            {active === section && (
              <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: 'var(--color-signal)' }} />
            )}
          </button>
        ))}
      </div>
      <Content />
    </div>
  );
}
