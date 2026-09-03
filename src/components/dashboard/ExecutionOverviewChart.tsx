'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';

export const ExecutionOverviewChart: React.FC = () => {
  const { activities } = useApp();

  const completed = activities.filter((a) => a.status === 'Completed').length;
  const inProgress = activities.filter((a) => a.status === 'In Progress' || a.status === 'Planned').length;
  const notStarted = activities.filter((a) => a.status === 'Not Started' || a.status === 'Overdue').length;
  const total = Math.max(1, activities.length);

  const completedPct = Math.round((completed / total) * 100);
  const inProgressPct = Math.round((inProgress / total) * 100);
  const notStartedPct = Math.max(0, 100 - completedPct - inProgressPct);

  const data = [
    { name: 'Completed', value: completed, color: '#10B981', pct: completedPct },
    { name: 'In Progress', value: inProgress, color: '#3B82F6', pct: inProgressPct },
    { name: 'Not Started', value: notStarted, color: '#94A3B8', pct: notStartedPct },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Execution Overview</h3>
          <p className="text-xs text-slate-500 font-medium">Departmental syllabus fulfillment</p>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
          Live Status
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 my-4">
        {/* Donut Chart Container */}
        <div className="relative h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} Plans`, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800">{completedPct}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Execution</span>
          </div>
        </div>

        {/* Legend / Stats */}
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-semibold text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{item.value}</span>
                <span className="text-[11px] font-medium text-slate-400">({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Master Plan: <strong>CSE Odd Sem 2025-26</strong></span>
        <span className="text-emerald-600 font-bold">Auto-Sync Active</span>
      </div>
    </div>
  );
};
