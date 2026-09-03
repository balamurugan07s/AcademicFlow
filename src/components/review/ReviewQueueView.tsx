'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  Sparkles,
  FileCode,
  UserCheck
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { CandidateMatch } from '../../types';

export const ReviewQueueView: React.FC = () => {
  const { reviewQueue, activities, approveReviewEvent, rejectReviewEvent, mapUnmatchedManually } = useApp();
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [manualMapOpen, setManualMapOpen] = useState<string | null>(null);
  const [manualTargetId, setManualTargetId] = useState<string>('');

  const handleSelectCandidate = (eventId: string, activityId: string) => {
    setSelectedCandidates((prev) => ({ ...prev, [eventId]: activityId }));
  };

  const handleApprove = (eventId: string) => {
    const chosen = selectedCandidates[eventId];
    approveReviewEvent(eventId, chosen);
  };

  const handleManualMapSubmit = (eventId: string) => {
    if (manualTargetId) {
      approveReviewEvent(eventId, manualTargetId);
      setManualMapOpen(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-sm">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Human Review & Verification Queue
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Medium-confidence execution logs (50% – 89%) flagged for coordinator confirmation to prevent hallucinated linking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
            {reviewQueue.length} Pending Verification
          </span>
        </div>
      </div>

      {/* Review Cards List */}
      {reviewQueue.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800">Review Queue is Clear!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All medium-confidence reports have been confirmed or reconciled by the departmental coordinator.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewQueue.map((event) => {
            const selectedActId = selectedCandidates[event.id] || event.candidates[0]?.activity_id;

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Event Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {event.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {event.faculty} • {event.class_section}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submitted on {formatDate(event.event_date)} ({event.delivery_mode})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full">
                      Confidence: {event.confidence_score}% (Review Required)
                    </span>
                  </div>
                </div>

                {/* Body Comparison */}
                <div className="p-6 space-y-5">
                  {/* Original Report */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                      Original Faculty Report
                    </span>
                    <p className="text-xs font-mono text-slate-100">
                      “{event.raw_text}”
                    </p>
                    <div className="mt-2 text-[11px] text-slate-400">
                      Extracted Intent: <strong>{event.activity_description}</strong>
                    </div>
                  </div>

                  {/* Candidate Activities Radio Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Select Best Matching Planned Academic Activity:
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Ranked by multi-factor score
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {event.candidates.map((cand, idx) => {
                        const isSelected = selectedActId === cand.activity_id;

                        return (
                          <label
                            key={cand.activity_id}
                            onClick={() => handleSelectCandidate(event.id, cand.activity_id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-100'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name={`candidate-${event.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectCandidate(event.id, cand.activity_id)}
                                className="mt-1 text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                                    Candidate {idx + 1}
                                  </span>
                                  <span className="font-mono text-xs font-extrabold text-blue-700">
                                    {cand.activity_id}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900">
                                  {cand.activity_name}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {cand.course} • {cand.unit}
                                </p>
                                <p className="text-[10px] text-slate-600 italic mt-1">
                                  {cand.match_explanation}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="text-right">
                                <span className={`text-base font-black ${
                                  cand.final_confidence >= 75 ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                  {cand.final_confidence}%
                                </span>
                                <span className="text-[9px] block text-slate-400 font-bold uppercase">
                                  Match
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Selection Dropdown if toggled */}
                  {manualMapOpen === event.id && (
                    <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl space-y-3 animate-in fade-in duration-100">
                      <span className="text-xs font-bold text-slate-800">
                        Choose Any Activity from Master Academic Plan:
                      </span>
                      <div className="flex items-center gap-3">
                        <select
                          value={manualTargetId}
                          onChange={(e) => setManualTargetId(e.target.value)}
                          className="flex-1 text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                        >
                          <option value="">-- Select Master Plan Target --</option>
                          {activities.map((a) => (
                            <option key={a.activity_id} value={a.activity_id}>
                              {a.activity_id}: {a.activity_name} ({a.course})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleManualMapSubmit(event.id)}
                          disabled={!manualTargetId}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg disabled:opacity-40"
                        >
                          Confirm Custom Mapping
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setManualMapOpen(manualMapOpen === event.id ? null : event.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{manualMapOpen === event.id ? 'Hide Custom Selector' : 'Manual Map from Full Syllabus...'}</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => rejectReviewEvent(event.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Match</span>
                    </button>

                    <button
                      onClick={() => handleApprove(event.id)}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 rounded-xl transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve & Commit (HUMAN_CONFIRMED)</span>
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
