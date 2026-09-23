import React from 'react';
import { AssetStatus, AssignmentStatus, MaintenanceStatus, ReportStatus, Role } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'role' | 'category' | 'default';
  status?: AssetStatus | AssignmentStatus | MaintenanceStatus | ReportStatus | string;
  role?: Role | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  role,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  // Format status colors
  let colorClasses = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';

  if (status) {
    switch (status) {
      case 'AVAILABLE':
      case 'COMPLETED':
      case 'RESOLVED':
      case 'ACTIVE':
        colorClasses = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
        break;
      case 'ASSIGNED':
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
        colorClasses = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
        break;
      case 'UNDER_MAINTENANCE':
      case 'SCHEDULED':
      case 'PENDING':
        colorClasses = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        break;
      case 'DAMAGED':
      case 'LOST':
      case 'REJECTED':
      case 'CANCELLED':
        colorClasses = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
        break;
      case 'RETIRED':
      case 'RETURNED':
      case 'INACTIVE':
        colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        break;
      default:
        colorClasses = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
    }
  } else if (role) {
    switch (role) {
      case 'ADMIN':
        colorClasses = 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
        break;
      case 'MANAGER':
        colorClasses = 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
        break;
      case 'EMPLOYEE':
        colorClasses = 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';
        break;
    }
  }

  const displayText = children || (status ? status.replace(/_/g, ' ') : role);

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} capitalize tracking-wide ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {displayText}
    </span>
  );
};
