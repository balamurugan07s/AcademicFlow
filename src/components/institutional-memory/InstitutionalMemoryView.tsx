'use client';

import React, { useState } from 'react';
import { History, TrendingUp, AlertTriangle, Lightbulb, Search, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InstitutionalMemoryView: React.FC = () => {
  const { activities } = useApp();
  const [selectedTopic, setSelectedTopic] = useState('CSE-DSA-L5-0042');
  const [activeQuery, setActiveQuery] = useState('How many sessions does Data Structures Unit III usually require?');

  const topicIntelligence = [
    {
      id: 'CSE-DSA-L5-0042',
      course: 'Data Structures',
      unit: 'Unit III — Linked Lists',
      topic: 'Singly & Doubly Linked List Implementation',
      plannedSessions: 3,
      historicalAvg: 4.2,
      variancePct: 40,
      confidenceRating: 'High Confidence (4 Semesters Data)',
      keyInsight:
        'Pointers and memory deallocation edge cases consistently require +1.2 extra lab sessions across 4 consecutive batches.',
      recommendation:
        'Increase base curriculum allocation from 3 sessions to 4 sessions in the 2026-27 Master Academic Plan.',
    },
    {
      id: 'CSE-DBMS-L5-0015',
      course: 'Database Management Systems',
      unit: 'Unit 6: Normalization',
      topic: '3NF & BCNF Functional Dependencies',
      plannedSessions: 6,
      historicalAvg: 7.4,
      variancePct: 23,
      confidenceRating: 'High Confidence (6 Semesters Data)',
      keyInsight:
        'Students struggle with lossless join decomposition and BCNF synthesis proofs.',
      recommendation:
        'Schedule a dedicated 1-session tutorial drill between 3NF and BCNF lectures.',
    },
    {
      id: 'CSE-CN-L5-0033',
      course: 'Computer Networks',
      unit: 'Unit 3: Transport Layer',
      topic: 'TCP Congestion Control & Sliding Window',
      plannedSessions: 4,
      historicalAvg: 4.9,
      variancePct: 22,
      confidenceRating: 'Medium Confidence (3 Semesters Data)',
      keyInsight:
        'Wireshark packet trace demonstrations take longer than theoretical derivations.',
      recommendation:
        'Pre-configure virtual lab environments to save 30 minutes of setup overhead.',
    },
  ];

  const selectedIntel = topicIntelligence.find((t) => t.id === selectedTopic) || topicIntelligence[0];

  const sampleQueries = [
    'How many sessions does Data Structures Unit III usually require?',
    'Which activities frequently exceed their planned duration?',
    'Which departments have the largest schedule variance?',
    'Show optimal buffer allocation for CSE 3rd Year',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-purple-800 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-xl text-purple-300">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Institutional Memory & Historical Execution Intelligence
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                AcademicFlow builds long-term memory across semesters. By comparing planned syllabus hours with empirical faculty execution logs, institutions can proactively design realistic, self-healing academic calendars.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full border border-purple-400/40 shrink-0">
            Prototype Historical Analytics
          </span>
        </div>
      </div>

      {/* Query Explorer Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          Institutional Memory Query Explorer
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setActiveQuery(q)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                activeQuery === q
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <span className="font-bold text-slate-800">Query Answer:</span>
          <p className="text-slate-700 leading-relaxed font-medium">
            Based on <strong>4 consecutive semesters of verified execution logs (2022–2025)</strong>, Data Structures Unit III (Linked Lists) requires an empirical average of <strong>4.2 sessions</strong> against the scheduled <strong>3 sessions (+40% variance)</strong>.
          </p>
        </div>
      </div>

      {/* Topic Intelligence Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Topic Selector */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Select Course Module
          </span>

          {topicIntelligence.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedTopic === t.id
                  ? 'bg-purple-50/70 border-purple-400 shadow-sm ring-2 ring-purple-100'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                  {t.id}
                </span>
                <span className="text-xs font-extrabold text-rose-600">
                  +{t.variancePct}% Variance
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">{t.topic}</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">{t.course} • {t.unit}</p>
            </button>
          ))}
        </div>

        {/* Right Deep Intelligence Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                {selectedIntel.course}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedIntel.unit} — {selectedIntel.topic}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {selectedIntel.confidenceRating}
            </span>
          </div>

          {/* 3 Metric Cards matching Section 14 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Planned Sessions</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">
                {selectedIntel.plannedSessions}
              </span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Historical Average</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {selectedIntel.historicalAvg}
              </span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-rose-700 block">Historical Variance</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                +{selectedIntel.variancePct}%
              </span>
            </div>
          </div>

          {/* Qualitative Insights */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Empirical Faculty Observation
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedIntel.keyInsight}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" /> AI Curriculum Optimization Suggestion
              </span>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {selectedIntel.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
