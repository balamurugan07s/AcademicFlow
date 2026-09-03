'use client';

import React from 'react';
import { X, Calendar, User, MapPin, BookOpen, Layers, History, ShieldCheck } from 'lucide-react';
import { AcademicActivity } from '../../types';
import { formatDate, getStatusBadgeClass } from '../../lib/utils';

interface PlanDetailModalProps {
  activity: AcademicActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({ activity, isOpen, onClose }) => {
  if (!isOpen || !activity) return null;

  const badge = getStatusBadgeClass(activity.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0B1528] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded">
                {activity.activity_id}
              </span>
              <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded">
                {activity.level}
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">{activity.activity_name}</h3>
            <p className="text-xs text-slate-300">{activity.course} • {activity.unit}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status & Progress Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500">Execution Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border} flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                  {activity.status}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {activity.completion_percentage}% Completed
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500">Schedule Deviation</span>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {activity.deviation_days > 0 ? (
                  <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    +{activity.deviation_days} Days Delay
                  </span>
                ) : (
                  <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    On Track
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Assigned Faculty
              </span>
              <p className="font-bold text-slate-800 text-sm">{activity.faculty}</p>
              <p className="text-slate-500">Class Section: <strong>{activity.class_section}</strong></p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Activity Type & Venue
              </span>
              <p className="font-bold text-slate-800 text-sm">{activity.activity_type}</p>
              <p className="text-slate-500">Location: {activity.location}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Planned Timeline
              </span>
              <p className="font-bold text-slate-800">{formatDate(activity.planned_start)}</p>
              <p className="text-slate-500">Planned Duration: <strong>{activity.planned_sessions} Sessions</strong></p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-600" /> Institutional Memory Metric
              </span>
              <p className="font-bold text-slate-800">
                Hist. Avg: {activity.historical_avg_sessions} Sessions
              </p>
              <p className={`font-semibold ${activity.historical_variance_pct > 20 ? 'text-amber-600' : 'text-slate-500'}`}>
                Variance: {activity.historical_variance_pct > 0 ? `+${activity.historical_variance_pct}%` : '0%'}
              </p>
            </div>
          </div>

          {/* Planned vs Executed Content */}
          <div className="space-y-3">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
              <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" /> Planned Syllabus Content
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activity.planned_content}
              </p>
            </div>

            {activity.actual_content && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Actual Executed Content (Extracted by AI)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activity.actual_content}
                </p>
                <div className="mt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                  <span>Executed On: {formatDate(activity.actual_start)}</span>
                  <span>•</span>
                  <span>Verified via AcademicFlow Engine</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
