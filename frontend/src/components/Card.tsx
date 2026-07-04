import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  noBorder?: boolean;
}

export function Card({ children, hoverable, noBorder, className = '', ...props }: CardProps) {
  return (
    <div
      className={`${
        noBorder
          ? 'bg-transparent'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6'
      } ${hoverable ? 'hover:shadow-md cursor-pointer transition-shadow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
