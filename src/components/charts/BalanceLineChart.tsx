import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { BalanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface BalanceLineChartProps {
  data: BalanceRecord[];
  lowThreshold?: number;
  criticalThreshold?: number;
  height?: number;
}

export const BalanceLineChart: React.FC<BalanceLineChartProps> = ({
  data,
  lowThreshold = 300,
  criticalThreshold = 100,
  height = 280,
}) => {
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date, 'short'),
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
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
                const item = payload[0].payload as BalanceRecord & { formattedDate: string };
                return (
                  <div className="bg-slate-900/95 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700/60 backdrop-blur-md">
                    <p className="font-medium text-slate-300">{formatDate(item.date, 'medium')}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">
                      {formatCurrency(item.balance)}
                    </p>
                    {item.isRecharge && (
                      <p className="text-cyan-300 text-[11px] mt-1 font-medium">
                        ✦ Recharged {formatCurrency(item.rechargeAmount)}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          {lowThreshold && (
            <ReferenceLine
              y={lowThreshold}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: 'Low Alert', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          {criticalThreshold && (
            <ReferenceLine
              y={criticalThreshold}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              label={{ value: 'Critical', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
