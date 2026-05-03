import { ReactNode } from 'react';

interface CardProps {
  hover?: boolean;
  premium?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({
  hover = true,
  premium = false,
  className = '',
  children,
}: CardProps) {
  const baseClasses = 'rounded-[1.7rem] border p-5 transition-all duration-300';

  let variantClasses = '';
  if (premium) {
    variantClasses = 'bc-premium-card';
  } else {
    variantClasses = 'bc-light-panel shadow-md';
    if (hover) {
      variantClasses += ' bc-card-hover';
    }
  }

  const combinedClassName = [baseClasses, variantClasses, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}