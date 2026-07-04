import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-200 dark:border-slate-700',
  outline:
    'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-emerald-500 dark:hover:border-emerald-500 active:bg-slate-100 dark:active:bg-slate-800',
  ghost: 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700',
  danger: 'bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs font-semibold rounded-md gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg gap-2',
  lg: 'px-6 py-3 text-base font-semibold rounded-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`${variantStyles[variant]} ${sizeStyles[size]} inline-flex items-center justify-center font-semibold transition-all duration-200 ${className || ''}`}
      disabled={isLoading || disabled}
      whileHover={{ scale: disabled ? 1 : 1.04 } as any}
      whileTap={{ scale: disabled ? 1 : 0.96 } as any}
      {...(props as any)}
    >
      {isLoading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-r-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}
