import { ReactNode, CSSProperties } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type Size = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

function variantStyle(variant: Variant): CSSProperties {
  switch (variant) {
    case 'success':
      return { background: 'var(--color-success-soft)', color: 'var(--color-success)', border: '1px solid var(--color-success)' };
    case 'warning':
      return { background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' };
    case 'danger':
      return { background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' };
    case 'info':
      return { background: 'var(--color-orbit-cyan-soft)', color: 'var(--color-orbit-cyan)', border: '1px solid var(--color-orbit-cyan)' };
    case 'neutral':
      return { background: 'var(--color-surface-raised)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' };
  }
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1.5 text-sm font-medium rounded-md',
};

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${sizeStyles[size]} ${className}`} style={variantStyle(variant)}>
      {children}
    </span>
  );
}
