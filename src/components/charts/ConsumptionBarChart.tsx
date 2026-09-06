import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BalanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface ConsumptionBarChartProps {
  data: BalanceRecord[];
  height?: number;
}

export const ConsumptionBarChart: React.FC<ConsumptionBarChartProps> = ({ data, height = 260 }) => {
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date, 'short'),
    consumptionValue: item.consumption || 75,
  }));

  const maxBarSize = data.length <= 7 ? 32 : data.length <= 14 ? 20 : 10;
  const tickInterval = data.length > 20 ? 3 : data.length > 10 ? 1 : 0;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.35} vertical={false} />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            width={52}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(val) => `৳${val}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700/60 backdrop-blur-md">
                    <p className="font-medium text-slate-300">{formatDate(item.date, 'medium')}</p>
                    <p className="text-amber-400 font-bold text-sm mt-0.5">
                      Daily Usage: {formatCurrency(item.consumptionValue)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="consumptionValue"
            fill="#0284c7"
            radius={[4, 4, 0, 0]}
            maxBarSize={maxBarSize}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
