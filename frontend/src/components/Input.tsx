import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
