import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  noBorder?: boolean;
}

export function Card({
  children,
  hoverable = false,
  noBorder = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`
        rounded-2xl p-6 transition-all duration-200
        ${
          noBorder
            ? 'bg-transparent'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
        }
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hoverable ? { y: -1 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
