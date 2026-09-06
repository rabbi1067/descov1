import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BalanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface AreaTrendChartProps {
  data: BalanceRecord[];
  height?: number;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({ data, height = 260 }) => {
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date, 'short'),
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.35} vertical={false} />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            interval={data.length > 20 ? 3 : data.length > 10 ? 1 : 0}
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
                const item = payload[0].payload as BalanceRecord;
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700/60 backdrop-blur-md">
                    <p className="font-medium text-slate-300">{formatDate(item.date, 'medium')}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">
                      {formatCurrency(item.balance)}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Burn rate: {formatCurrency(item.consumption || 0)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#059669"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
