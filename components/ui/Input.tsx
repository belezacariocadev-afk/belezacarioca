import { Search, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: 'search' | 'password';
  label?: string;
  error?: string;
}

export function Input({
  icon,
  label,
  error,
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password' || icon === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const baseClasses = 'w-full h-12 px-4 py-3 rounded-lg border border-light bg-white text-bc-text placeholder-bc-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bc-purple focus:border-bc-purple';

  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';

  const combinedClassName = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-bc-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon === 'search' && (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bc-muted" />
        )}
        <input
          type={inputType}
          className={`${combinedClassName} ${icon === 'search' ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bc-muted hover:text-bc-text"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}