import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

interface DoughnutChartProps {
  peakUsage?: number;
  offPeakUsage?: number;
  rechargeRatio?: number;
  height?: number;
}

const COLORS = ['#059669', '#0284c7', '#f59e0b'];

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  peakUsage = 480,
  offPeakUsage = 340,
  rechargeRatio = 120,
  height = 240,
}) => {
  const data = [
    { name: 'Peak Hours Usage (5pm-11pm)', value: peakUsage },
    { name: 'Off-Peak Hours (11pm-5pm)', value: offPeakUsage },
    { name: 'Fixed Charges & Taxes', value: rechargeRatio },
  ];

  return (
    <div style={{ width: '100%', height }} className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700/60 backdrop-blur-md">
                    <p className="font-medium text-slate-300">{item.name}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">
                      {formatCurrency(Number(item.value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] text-slate-400 font-medium">Total Ratio</span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">100%</span>
      </div>
    </div>
  );
};
