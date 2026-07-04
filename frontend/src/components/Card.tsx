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
        rounded-xl p-5 transition-all
        ${noBorder ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}
        ${hoverable ? 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hoverable ? { y: -2 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
