// Page header: title, breadcrumb, optional right-aligned actions. Used at the top of every route.
import type { ReactNode } from 'react';

interface StageHeaderProps {
  title: string;
  crumb: string;
  actions?: ReactNode;
}

export function StageHeader({ title, crumb, actions }: StageHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h1 className="font-display text-[22px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        <div className="mt-0.5 font-mono text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {crumb}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
