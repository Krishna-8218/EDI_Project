import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  if (meta.totalPages <= 1) return null;

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-100 dark:border-gray-800/80">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-900 dark:text-white">{start}</span> to{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{end}</span> of{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{meta.total}</span> results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const isEllipsis = prev && p - prev > 1;

            return (
              <React.Fragment key={p}>
                {isEllipsis && (
                  <span className="px-2 text-xs text-gray-400 dark:text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    p === meta.page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
