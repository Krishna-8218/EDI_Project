import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  className = '',
}) => {
  const btnLabel = actionText || actionLabel;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 shadow-sm border border-gray-100 dark:border-gray-700/60 mb-4">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {btnLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {btnLabel}
        </Button>
      )}
    </div>
  );
};
