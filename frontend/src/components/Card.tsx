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
  style,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`rounded-2xl p-5 transition-all ${hoverable ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        background: noBorder ? 'transparent' : 'var(--color-surface)',
        border: noBorder ? 'none' : '1px solid var(--color-border)',
        ...style,
      }}
      whileHover={hoverable ? { y: -2 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
