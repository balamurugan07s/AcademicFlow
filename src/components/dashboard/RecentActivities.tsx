'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Sparkles, FileText, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';

export const RecentActivities: React.FC = () => {
  const { auditLogs } = useApp();

  const recentItems = auditLogs.slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case 'AUTO_LINKED':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      case 'HUMAN_CONFIRMED':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Activities</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time execution ingestion</p>
        </div>
        <Link
          href="/audit-trail"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Audit Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 my-2">
        {recentItems.map((log) => (
          <div key={log.id} className="py-3 flex items-start gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-50 transition-colors">
              {getIcon(log.decision_type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {log.extracted_data.activity}
                </p>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {log.source_excerpt}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  log.decision_type === 'AUTO_LINKED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {log.decision_type === 'AUTO_LINKED' ? '⚡ Auto-Linked (94%+)' : '✓ Human Confirmed'}
                </span>
                <span className="text-[10px] text-slate-400">
                  by {log.performed_by.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center">
        <Link
          href="/execution"
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
        >
          <span>+ Report New Execution Session</span>
        </Link>
      </div>
    </div>
  );
};
