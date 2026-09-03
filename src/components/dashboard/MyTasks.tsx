'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Calendar, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MyTasks: React.FC = () => {
  const { reviewQueue } = useApp();

  const staticTasks = [
    {
      id: 'task-1',
      title: 'Review Execution Report - AI Lab (A* Search)',
      due: 'Due today',
      dueColor: 'text-rose-600 bg-rose-50 border-rose-200',
      course: 'Artificial Intelligence',
      faculty: 'Dr. R. Sharma',
      link: '/review-queue',
      type: 'Verification',
    },
    {
      id: 'task-2',
      title: 'Approve Plan - DS Course (Unit III Linked Lists)',
      due: 'Due tomorrow',
      dueColor: 'text-amber-600 bg-amber-50 border-amber-200',
      course: 'Data Structures',
      faculty: 'Prof. Kumar',
      link: '/plans',
      type: 'Approval',
    },
    {
      id: 'task-3',
      title: 'Verify Execution - DBMS Lab (PostgreSQL DML)',
      due: 'Due in 2 days',
      dueColor: 'text-blue-600 bg-blue-50 border-blue-200',
      course: 'Database Management Systems',
      faculty: 'Prof. A. Kumar',
      link: '/plan-vs-execution',
      type: 'Quality Check',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">My Tasks</h3>
          <p className="text-xs text-slate-500 font-medium">HOD & Coordinator action items</p>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {staticTasks.length + reviewQueue.length} Pending
        </span>
      </div>

      <div className="space-y-3 my-2">
        {/* Dynamic task for any pending review items */}
        {reviewQueue.length > 0 && (
          <Link
            href="/review-queue"
            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex items-center justify-between group block"
          >
            <div className="min-w-0 flex-1 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-800">
                  ⚡ AI Match Review
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-rose-700 bg-rose-100/80 border-rose-300">
                  Needs Action
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                Verify {reviewQueue.length} Pending Report(s) in Human Review Queue
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review medium-confidence AI suggestions for SQL / DBMS topics
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}

        {staticTasks.map((t) => (
          <Link
            key={t.id}
            href={t.link}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center justify-between group block"
          >
            <div className="min-w-0 flex-1 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {t.type}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.dueColor}`}>
                  {t.due}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                {t.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.course} • Assigned to {t.faculty}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Auto-assigned from academic calendar</span>
        <Link
          href="/review-queue"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          View All Tasks →
        </Link>
      </div>
    </div>
  );
};
