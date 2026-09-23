import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface BarChartProps {
  data: { category: string; count: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No category data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.7} />
          <XAxis
            dataKey="category"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs py-2 px-3 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{item.category}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.count} assets</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
