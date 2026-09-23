import React from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AreaChartProps {
  data: { month: string; value: number; label?: string }[];
  color?: string;
  dataKey?: string;
  valuePrefix?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  color = '#8b5cf6',
  dataKey = 'value',
  valuePrefix = '',
}) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id={`areaGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl border border-gray-800 backdrop-blur-md">
                    <p className="font-semibold text-gray-300">{item.month}</p>
                    <p className="text-white font-bold">
                      {valuePrefix}
                      {item[dataKey].toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#areaGradient-${color})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
