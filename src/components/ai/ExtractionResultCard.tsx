'use client';

import React from 'react';
import Link from 'next/link';
import { ExtractedEvent } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  GitCompare,
  ShieldCheck,
  FileCode,
  ArrowRight,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const ExtractionResultCard: React.FC<{ event: ExtractedEvent | null }> = ({ event }) => {
  if (!event) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-bold text-slate-800">No Execution Event Ingested Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Submit a report from the Execution Tracking page or launch one of the SIH demo presets.
        </p>
      </div>
    );
  }

  const bestCandidate = event.candidates[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {event.id}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Report ID: {event.report_id}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            AI Semantic Extraction & Link Result
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            event.status === 'AUTO_LINKED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : event.status === 'REVIEW_REQUIRED'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            {event.status === 'AUTO_LINKED'
              ? '⚡ AUTO-LINKED (>=90%)'
              : event.status === 'REVIEW_REQUIRED'
              ? '⏳ IN REVIEW QUEUE (50-89%)'
              : '❓ UNMATCHED ACTIVITY (<50%)'}
          </span>
        </div>
      </div>

      {/* Raw Input vs Extracted Entities Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Raw Ingestion Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Raw Unstructured Faculty Input
            </span>
            <span className="text-[10px] text-slate-400">{event.delivery_mode}</span>
          </div>
          <p className="text-xs font-mono text-slate-200 bg-slate-800/80 p-3 rounded-lg border border-slate-700 leading-relaxed">
            “{event.raw_text}”
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Faculty: <strong>{event.faculty}</strong></span>
            <span>Date: <strong>{formatDate(event.event_date)}</strong></span>
          </div>
        </div>

        {/* Structured AI Output Box */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" /> Structured Entity Extraction
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Activity / Topic</span>
              <p className="font-bold text-slate-800">{event.activity_description}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Class Section</span>
              <p className="font-bold text-blue-700">{event.class_section}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Department</span>
              <p className="font-bold text-slate-800 truncate">{event.department}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Inferred Course</span>
              <p className="font-bold text-slate-800 truncate">{event.course}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Candidate Match */}
      {bestCandidate && (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950">
                Matched Master Academic Plan Target
              </span>
            </div>
            <span className="text-xs font-mono font-black text-emerald-700 bg-white border border-emerald-300 px-2.5 py-0.5 rounded-full">
              {bestCandidate.final_confidence}% Match
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-extrabold text-blue-700">
                  {bestCandidate.activity_id}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {bestCandidate.course} • {bestCandidate.unit}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {bestCandidate.activity_name}
              </h4>
            </div>

            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg shrink-0">
              Status Updated: Completed
            </span>
          </div>
        </div>
      )}

      {/* Action Links */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/execution"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            ← Submit Another Report
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plan-vs-execution"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-all"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Verify in Plan vs Execution</span>
          </Link>
          <Link
            href="/audit-trail"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>View Immutable Audit Log</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
