import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Spinner({ size = 'md', color = 'currentColor' }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="inline-flex"
    >
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m4 4l2.83 2.83M2 12h4m12 0h4m-4.22 8.22l2.83-2.83m-4-4l-2.83-2.83M19.78 4.22l-2.83 2.83m-4-4l-2.83 2.83" />
        <circle cx="12" cy="12" r="1" fill={color} />
      </svg>
    </motion.div>
  );
}
