import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  leftIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-3.5 py-2 text-sm font-medium rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-card active:scale-[0.98]',
    gradient:
      'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-card active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 active:scale-[0.98]',
  };

  const displayIcon = icon || leftIcon;

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : displayIcon ? (
        <span className="shrink-0">{displayIcon}</span>
      ) : null}
      {children}
    </button>
  );
};
