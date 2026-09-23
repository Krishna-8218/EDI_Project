import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AssetStatus } from '../../types';

interface DonutChartProps {
  data: { status: AssetStatus; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981', // emerald
  ASSIGNED: '#3b82f6', // blue
  UNDER_MAINTENANCE: '#f59e0b', // amber
  DAMAGED: '#f43f5e', // rose
  LOST: '#8b5cf6', // purple
  RETIRED: '#64748b', // slate
};

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const chartData = data.filter((d) => d.count > 0);
  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No status data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs py-2 px-3 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800">
                      <p className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">{item.status.replace(/_/g, ' ').toLowerCase()}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                        {item.count} assets ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              dataKey="count"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.status}`}
                  fill={STATUS_COLORS[entry.status] || '#6366f1'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{total}</span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Total Assets</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLORS[item.status] || '#6366f1' }}
            />
            <span className="capitalize">{item.status.toLowerCase().replace(/_/g, ' ')}</span>
            <span className="font-semibold text-slate-900 dark:text-white">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
