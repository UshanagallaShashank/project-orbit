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
          : 'bg-white border border-gray-200 rounded p-4'
      } ${hoverable ? 'hover:shadow-sm cursor-pointer transition-shadow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
