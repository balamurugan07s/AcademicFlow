'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  Link as LinkIcon,
  XCircle,
  CheckCircle2,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const UnmatchedActivityView: React.FC = () => {
  const { unmatchedQueue, activities, mapUnmatchedManually, addUnmatchedAsExtraActivity, rejectUnmatchedActivity } = useApp();
  const [selectedMapTarget, setSelectedMapTarget] = useState<Record<string, string>>({});
  const [extraTitle, setExtraTitle] = useState<Record<string, string>>({});
  const [showManualSelect, setShowManualSelect] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-950">
              Unmatched Academic Execution Workflow
            </h3>
            <p className="text-xs text-purple-800 mt-0.5">
              Activities with confidence score &lt; 50% (e.g. ad-hoc placement drives, guest lectures, non-syllabus sessions).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-purple-900 bg-purple-200/80 px-3 py-1 rounded-full">
            {unmatchedQueue.length} Unmatched Report(s)
          </span>
        </div>
      </div>

      {/* Core Principle Notice */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          <strong>AcademicFlow Zero-Data-Loss Guarantee:</strong> No execution event is ever silently discarded. Faculty efforts are captured, categorized as co-curricular extra activities, or mapped with human oversight.
        </p>
      </div>

      {/* List */}
      {unmatchedQueue.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800">No Unmatched Activities Pending</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All execution submissions have been either mapped to master academic plans or filed under extra activities.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {unmatchedQueue.map((event) => {
            const bestCandidate = event.candidates[0];
            const isManualOpen = showManualSelect[event.id];

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-purple-100 bg-purple-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                        {event.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {event.faculty} • {event.department}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Logged on {formatDate(event.event_date)} • Mode: {event.delivery_mode}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-purple-700 bg-purple-100 border border-purple-300 px-3 py-1 rounded-full">
                    Confidence: {event.confidence_score}% (Unmatched)
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  <div className="p-4 bg-slate-900 text-white rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                      Raw Faculty Log
                    </span>
                    <p className="text-xs font-mono text-slate-100">
                      “{event.raw_text}”
                    </p>
                  </div>

                  {bestCandidate && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Weakest Closest Match in Master Plan:
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Score: {bestCandidate.final_confidence}% (Below 50% Threshold)
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                        <p className="font-bold text-slate-800">
                          {bestCandidate.activity_id}: {bestCandidate.activity_name}
                        </p>
                        <p className="text-[11px] text-slate-500">{bestCandidate.match_explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Manual selector dropdown */}
                  {isManualOpen && (
                    <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-purple-950">
                        Select Target Academic Plan Activity:
                      </span>
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedMapTarget[event.id] || ''}
                          onChange={(e) => setSelectedMapTarget({ ...selectedMapTarget, [event.id]: e.target.value })}
                          className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                        >
                          <option value="">-- Choose target plan --</option>
                          {activities.map((a) => (
                            <option key={a.activity_id} value={a.activity_id}>
                              {a.activity_id}: {a.activity_name} ({a.course})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => mapUnmatchedManually(event.id, selectedMapTarget[event.id])}
                          disabled={!selectedMapTarget[event.id]}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg disabled:opacity-40"
                        >
                          Commit Map
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4 Core Required Workflow Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowManualSelect({ ...showManualSelect, [event.id]: !isManualOpen })}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Map Manually</span>
                    </button>

                    <button
                      onClick={() => addUnmatchedAsExtraActivity(event.id, extraTitle[event.id])}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add as Extra Activity</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectUnmatchedActivity(event.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-xl transition-all"
                    >
                      <span>Mark Outside Academic Scope</span>
                    </button>

                    <button
                      onClick={() => rejectUnmatchedActivity(event.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
