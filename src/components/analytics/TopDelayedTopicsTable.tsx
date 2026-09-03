'use client';

import React from 'react';
import { AlertCircle, ArrowUpRight, Flame } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Link from 'next/link';

export const TopDelayedTopicsTable: React.FC = () => {
  const delayedTopics = [
    {
      course: 'Database Management Systems',
      unit: 'Unit 3: Relational Model',
      plannedDate: '2026-08-31',
      actualDate: '2026-09-03',
      delayDays: 3,
      reason: 'Additional hands-on Relational Algebra practice needed',
    },
    {
      course: 'Software Engineering',
      unit: 'Unit 2: Requirements Elicitation',
      plannedDate: '2026-08-20',
      actualDate: '2026-08-24',
      delayDays: 4,
      reason: 'SRS review workshop took 2 extra lecture sessions',
    },
    {
      course: 'Data Structures',
      unit: 'Unit 4: Trees',
      plannedDate: '2026-09-10',
      actualDate: '2026-09-18',
      delayDays: 8,
      reason: 'BST deletion edge cases required remedial practical lab',
    },
    {
      course: 'Operating Systems',
      unit: 'Unit 2: Process Scheduling',
      plannedDate: '2026-08-10',
      actualDate: 'Pending',
      delayDays: 12,
      reason: 'Faculty medical leave; substitute buffer in progress',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            Top Delayed Topics
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Academic activities with the largest positive schedule variance
          </p>
        </div>

        <Link
          href="/plans"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Adjust Master Plan</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Unit / Topic</th>
              <th className="py-3 px-3">Planned Date</th>
              <th className="py-3 px-3">Actual Date</th>
              <th className="py-3 px-4 text-right">Delay (Days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {delayedTopics.map((item, idx) => (
              <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  {item.course}
                </td>
                <td className="py-3.5 px-4 text-slate-800">
                  <span>{item.unit}</span>
                  <span className="block text-[10px] text-slate-400 font-normal">{item.reason}</span>
                </td>
                <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                  {formatDate(item.plannedDate)}
                </td>
                <td className="py-3.5 px-3 text-slate-800 font-semibold whitespace-nowrap">
                  {item.actualDate === 'Pending' ? (
                    <span className="text-rose-600 font-bold">Unexecuted (Overdue)</span>
                  ) : (
                    formatDate(item.actualDate)
                  )}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold text-xs">
                    +{item.delayDays} Days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Variance insights fed into <strong>Institutional Memory</strong></span>
        <span className="text-slate-400 font-medium">Auto-updated via Execution Logs</span>
      </div>
    </div>
  );
};
