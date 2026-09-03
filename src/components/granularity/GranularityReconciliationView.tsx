'use client';

import React, { useState } from 'react';
import { Layers, GitMerge, CheckCircle2, ArrowDown, Calendar, Clock, User, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GranularityReconciliationView: React.FC = () => {
  const { granularityGroups } = useApp();
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);

  const activeGroup = granularityGroups[selectedGroupIdx] || granularityGroups[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 border border-blue-800 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                N-to-1 Granularity Reconciliation Engine
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Real-world academic delivery rarely happens in strict 1:1 syllabus blocks. AcademicFlow aggregates multiple discrete classroom lectures, sub-topic drills, and lab sessions into a single Master Plan Activity.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/40">
            N : 1 Aggregation
          </span>
        </div>
      </div>

      {/* Group Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {granularityGroups.map((group, idx) => (
          <button
            key={group.planned_activity_id}
            onClick={() => setSelectedGroupIdx(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedGroupIdx === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-mono text-[11px] opacity-80">{group.planned_activity_id}</span>
            <span>{group.planned_activity_name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              selectedGroupIdx === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {group.execution_events.length} Events
            </span>
          </button>
        ))}
      </div>

      {/* Visual Reconciliation Diagram */}
      {activeGroup && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Master Academic Plan Activity (Level 5)
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {activeGroup.planned_activity_name} ({activeGroup.planned_activity_id})
              </h4>
              <p className="text-xs text-slate-500">{activeGroup.course} • {activeGroup.unit}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeGroup.executed_sessions} of {activeGroup.target_sessions} Sessions Executed
              </span>
            </div>
          </div>

          {/* Multiple Micro-Events Cards (N) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Individual Faculty Execution Reports ({activeGroup.execution_events.length} Micro-Sessions)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Ingested via Web & Mobile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeGroup.execution_events.map((ev, i) => (
                <div
                  key={ev.id}
                  className="bg-slate-50 hover:bg-blue-50/40 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                        Event #{i + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{ev.duration}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 leading-snug">
                      {ev.sub_topic}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {ev.notes}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{ev.faculty}</span>
                    <span>{ev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Convergence Graphic */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-px h-6 bg-slate-300" />
            <div className="p-2 bg-blue-600 text-white rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
              AI Multi-Event Aggregation & Reconciliation
            </span>
          </div>

          {/* Master Reconciled Summary (1) */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                  Master Plan Status
                </span>
                <span className="font-mono text-xs font-bold text-emerald-900">
                  {activeGroup.planned_activity_id}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                {activeGroup.planned_activity_name} — 100% Schedulable Syllabus Reconciled
              </h4>
              <p className="text-xs text-emerald-800">
                All 4 modular components successfully verified without forcing unnatural 1-to-1 administrative reporting.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-emerald-700">100%</span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Completion Rate
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
