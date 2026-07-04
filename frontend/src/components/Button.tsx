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
    'bg-green-500 hover:bg-green-600 text-white font-medium shadow-sm hover:shadow-md',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
  outline:
    'border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-900 font-medium dark:border-slate-600 dark:hover:bg-slate-900 dark:text-slate-100',
  ghost: 'hover:bg-slate-100 text-slate-700 font-medium dark:hover:bg-slate-800 dark:text-slate-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow-md',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
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
      className={`${variantStyles[variant]} ${sizeStyles[size]} inline-flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
      disabled={isLoading || disabled}
      whileHover={{ y: -1 } as any}
      whileTap={{ y: 0 } as any}
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
