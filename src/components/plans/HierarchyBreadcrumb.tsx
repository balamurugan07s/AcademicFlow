'use client';

import React from 'react';
import { ChevronRight, Layers } from 'lucide-react';

export const HierarchyBreadcrumb: React.FC<{
  semester?: string;
  department?: string;
  course?: string;
  unit?: string;
  activity?: string;
  session?: string;
}> = ({
  semester = '2026 Odd Semester',
  department = 'CSE Department',
  course = 'Data Structures',
  unit = 'Unit III — Linked Lists',
  activity = 'Linked List Implementation',
  session = 'Singly Linked List Practical'
}) => {
  const levels = [
    { tag: 'L1', label: semester, color: 'bg-blue-100 text-blue-800' },
    { tag: 'L2', label: department, color: 'bg-indigo-100 text-indigo-800' },
    { tag: 'L3', label: course, color: 'bg-cyan-100 text-cyan-800' },
    { tag: 'L4', label: unit, color: 'bg-violet-100 text-violet-800' },
    { tag: 'L5', label: activity, color: 'bg-amber-100 text-amber-800' },
    { tag: 'L6', label: session, color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Institutional Hierarchy Explorer (L1 — L6 Master Execution Decomposition)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {levels.map((lvl, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs transition-colors">
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${lvl.color}`}>
                {lvl.tag}
              </span>
              <span className="font-semibold text-slate-800">{lvl.label}</span>
            </div>
            {index < levels.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
