import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface WeeklyChartProps {
  height?: number;
  data?: Array<{ day: string; currentWeek: number; previousWeek: number }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ height = 260, data: customData }) => {
  const defaultData = [
    { day: 'Mon', currentWeek: 82, previousWeek: 76 },
    { day: 'Tue', currentWeek: 90, previousWeek: 84 },
    { day: 'Wed', currentWeek: 70, previousWeek: 92 },
    { day: 'Thu', currentWeek: 85, previousWeek: 80 },
    { day: 'Fri', currentWeek: 95, previousWeek: 88 },
    { day: 'Sat', currentWeek: 110, previousWeek: 104 },
    { day: 'Sun', currentWeek: 105, previousWeek: 98 },
  ];

  const data = customData && customData.length > 0 ? customData : defaultData;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.35} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
          <YAxis width={46} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `৳${v}`} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700/60 backdrop-blur-md">
                    <p className="font-semibold text-slate-200">{label}</p>
                    <p className="text-emerald-400 mt-1">Current: ৳{payload[0]?.value}</p>
                    <p className="text-slate-400">Previous: ৳{payload[1]?.value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Bar dataKey="currentWeek" name="This Week (৳)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="previousWeek" name="Last Week (৳)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
