'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle2, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KpiCards: React.FC = () => {
  const { activities } = useApp();

  const totalPlans = activities.length;
  const completedPlans = activities.filter(a => a.status === 'Completed').length;
  const inProgressPlans = activities.filter(a => a.status === 'In Progress' || a.status === 'Planned').length;
  const overduePlans = activities.filter(a => a.status === 'Overdue' || a.deviation_days > 5).length;

  const kpis = [
    {
      label: 'Total Plans',
      count: totalPlans,
      sublabel: 'Master academic modules',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-100/70 text-blue-700',
      trend: '+4 this sem',
      link: '/plans',
    },
    {
      label: 'In Progress',
      count: inProgressPlans,
      sublabel: 'Actively lecturing & labs',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badgeBg: 'bg-amber-100/70 text-amber-700',
      trend: '67% pace',
      link: '/plan-vs-execution',
    },
    {
      label: 'Completed',
      count: completedPlans,
      sublabel: 'Verified & reconciled',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-100/70 text-emerald-700',
      trend: `${Math.round((completedPlans / totalPlans) * 100)}% done`,
      link: '/plan-vs-execution',
    },
    {
      label: 'Overdue',
      count: overduePlans,
      sublabel: 'Exceeding variance limits',
      icon: AlertOctagon,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      badgeBg: 'bg-rose-100/70 text-rose-700',
      trend: 'Action needed',
      link: '/analytics',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl p-5 border ${kpi.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {kpi.label}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {kpi.count}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{kpi.sublabel}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${kpi.badgeBg}`}>
                {kpi.trend}
              </span>
              <Link
                href={kpi.link}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
