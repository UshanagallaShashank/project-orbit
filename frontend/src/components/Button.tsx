import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
}

function variantStyle(variant: Variant, disabled: boolean): CSSProperties {
  const base: CSSProperties = { opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' };
  switch (variant) {
    case 'primary':
      return { ...base, background: 'var(--color-signal)', color: 'var(--color-void, #08090d)' };
    case 'secondary':
      return { ...base, background: 'var(--color-surface-raised)', color: 'var(--color-text-primary)' };
    case 'outline':
      return { ...base, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' };
    case 'ghost':
      return { ...base, background: 'transparent', color: 'var(--color-text-secondary)' };
    case 'danger':
      return { ...base, background: 'var(--color-danger)', color: '#fff' };
  }
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-lg',
  lg: 'px-6 py-3 text-base font-medium rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(isLoading || disabled);
  return (
    <motion.button
      className={`${sizeStyles[size]} inline-flex items-center gap-2 transition-all ${className || ''}`}
      style={{ ...variantStyle(variant, isDisabled), ...style }}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.02 } as any}
      whileTap={{ scale: isDisabled ? 1 : 0.98 } as any}
      {...(props as any)}
    >
      {isLoading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}
