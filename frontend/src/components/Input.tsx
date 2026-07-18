import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', style, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border px-3 py-2 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        style={{
          background: 'var(--color-surface-raised)',
          borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          color: 'var(--color-text-primary)',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
          {error}
        </span>
      )}
      {hint && (
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}
