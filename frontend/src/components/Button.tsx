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
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-200 dark:border-slate-700 transition-colors',
  outline:
    'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-500 active:bg-slate-100 dark:active:bg-slate-800 transition-colors',
  ghost: 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-base font-medium rounded-lg gap-2',
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
      className={`${variantStyles[variant]} ${sizeStyles[size]} inline-flex items-center justify-center duration-200 ${className || ''}`}
      disabled={isLoading || disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 } as any}
      whileTap={{ scale: disabled ? 1 : 0.98 } as any}
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
