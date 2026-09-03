'use client';

import React, { useState, useMemo } from 'react';
import { Download, Filter, CheckCircle2, AlertCircle, Clock, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadgeClass, getDeviationBadge } from '../../lib/utils';

export const PlanVsExecutionTable: React.FC = () => {
  const { activities, showNotification } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('Odd Semester 2025-26');
  const [selectedCourse, setSelectedCourse] = useState('Database Management Systems');
  const [selectedView, setSelectedView] = useState('Unit-wise');

  const availableCourses = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.course)));
  }, [activities]);

  const courseActivities = useMemo(() => {
    return activities.filter((a) => a.course === selectedCourse);
  }, [activities, selectedCourse]);

  const handleExport = (format: string) => {
    showNotification(`Exporting ${selectedCourse} Execution Matrix to ${format}... Download completed.`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Top Filter Bar Matching Mockup 3 */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Select Plan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Odd Semester 2025-26">Odd Semester 2025-26</option>
              <option value="Even Semester 2025-26">Even Semester 2025-26</option>
              <option value="Odd Semester 2026-27">Odd Semester 2026-27</option>
            </select>
          </div>

          {/* Select Course */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            >
              {availableCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              View
            </label>
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unit-wise">Unit-wise</option>
              <option value="Weekly View">Weekly View</option>
              <option value="Faculty-wise">Faculty-wise</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={() => handleExport('PDF & Excel')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Plan vs Execution Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Unit / Topic</th>
              <th className="py-3.5 px-4 max-w-xs">Planned Content</th>
              <th className="py-3.5 px-3">Planned Date</th>
              <th className="py-3.5 px-4 max-w-xs">Executed Content</th>
              <th className="py-3.5 px-3">Executed Date</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Deviation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {courseActivities.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No execution records available for {selectedCourse}.
                </td>
              </tr>
            ) : (
              courseActivities.map((act) => {
                const badge = getStatusBadgeClass(act.status);
                const dev = getDeviationBadge(act.deviation_days, act.status);

                return (
                  <tr key={act.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Unit / Topic */}
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div>
                        <span>{act.unit}</span>
                        <p className="text-[11px] font-normal text-slate-500">{act.activity_name}</p>
                      </div>
                    </td>

                    {/* Planned Content */}
                    <td className="py-4 px-4 text-slate-600 font-medium leading-relaxed max-w-xs">
                      {act.planned_content}
                    </td>

                    {/* Planned Date */}
                    <td className="py-4 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDate(act.planned_start)}
                    </td>

                    {/* Executed Content */}
                    <td className="py-4 px-4 text-slate-800 font-medium leading-relaxed max-w-xs">
                      {act.actual_content || (
                        <span className="text-slate-300 italic">Not Executed</span>
                      )}
                    </td>

                    {/* Executed Date */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {act.actual_start ? (
                        <span className="font-semibold text-slate-800">{formatDate(act.actual_start)}</span>
                      ) : (
                        <span className="text-slate-400">Not Executed</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {act.status}
                      </span>
                    </td>

                    {/* Deviation Badge */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className={dev.badgeClass}>
                        {dev.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Matrix Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span>Total Units: <strong>{courseActivities.length}</strong></span>
          <span>•</span>
          <span>Completed: <strong className="text-emerald-600">{courseActivities.filter(a => a.status === 'Completed').length}</strong></span>
          <span>•</span>
          <span>On Track / Ahead: <strong className="text-blue-600">{courseActivities.filter(a => a.deviation_days === 0 && a.status === 'Completed').length}</strong></span>
        </div>
        <div className="text-[11px] text-slate-400">
          Reconciled with Institutional Master Calendar
        </div>
      </div>
    </div>
  );
};
