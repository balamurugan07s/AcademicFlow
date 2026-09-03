'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const DeviationBarChart: React.FC = () => {
  const data = [
    { category: 'On Track', count: 28, fill: '#10B981' },
    { category: '1-3 Days', count: 16, fill: '#F59E0B' },
    { category: '4-7 Days', count: 6, fill: '#EF4444' },
    { category: '>7 Days', count: 2, fill: '#B91C1C' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Deviation by Days</h3>
          <p className="text-xs text-slate-500 font-medium">
            Distribution of schedule delay across all academic modules
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          Semester Metric
        </span>
      </div>

      <div className="h-64 w-full my-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={[0, 30]}
            />
            <Tooltip
              formatter={(value: any) => [`${value} Modules`, 'Count']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={55}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Target SLA: <strong>&lt; 3 Days Deviation</strong></span>
        <span className="text-emerald-600 font-bold">84% Compliance</span>
      </div>
    </div>
  );
};
