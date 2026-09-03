'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsKpiCards: React.FC = () => {
  const { activities } = useApp();

  const onTrack = 28;
  const minorDelay = 16;
  const delayed = 16;
  const notStarted = 4;

  const cards = [
    {
      label: 'On Track',
      count: onTrack,
      pct: '58%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle2,
    },
    {
      label: '1–3 Days Delay',
      count: minorDelay,
      pct: '33%',
      sublabel: 'Minor variance',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Clock,
    },
    {
      label: 'Delayed (>3 Days)',
      count: delayed,
      pct: '33%',
      sublabel: 'Requires buffer review',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      icon: AlertTriangle,
    },
    {
      label: 'Not Started',
      count: notStarted,
      pct: '9%',
      sublabel: 'Scheduled in syllabus',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-5 border ${c.borderColor} shadow-sm flex items-center justify-between`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {c.label}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-extrabold ${c.color}`}>{c.count}</span>
                <span className="text-xs font-semibold text-slate-400">({c.pct})</span>
              </div>
              {c.sublabel && (
                <p className="text-[11px] text-slate-400 mt-0.5">{c.sublabel}</p>
              )}
            </div>

            <div className={`p-3 rounded-xl ${c.bgColor} ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
