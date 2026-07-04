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
        rounded-2xl transition-all duration-300
        ${
          noBorder
            ? 'bg-transparent'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
        }
        ${hoverable ? 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : ''}
        ${className}
      `}
      style={{ padding: noBorder ? undefined : '24px' }}
      whileHover={hoverable ? { y: -4 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
