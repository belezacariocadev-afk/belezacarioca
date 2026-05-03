import { LoaderCircle } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bc-button-primary',
    secondary: 'bc-button-secondary',
  };

  const combinedClassName = [
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-[var(--bc-purple)]',
    sizeClasses[size],
    variantClasses[variant],
    loading && 'cursor-not-allowed opacity-70',
    disabled && 'cursor-not-allowed opacity-50',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}