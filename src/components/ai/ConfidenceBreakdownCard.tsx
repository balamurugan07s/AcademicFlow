'use client';

import React from 'react';
import { CandidateMatch, ConfidenceThresholds } from '../../types';
import { Sparkles, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ConfidenceBreakdownProps {
  candidate: CandidateMatch | undefined;
  thresholds: ConfidenceThresholds;
}

export const ConfidenceBreakdownCard: React.FC<ConfidenceBreakdownProps> = ({ candidate, thresholds }) => {
  if (!candidate) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center text-slate-400 text-xs">
        No candidate match selected for breakdown.
      </div>
    );
  }

  const { semantic_score, course_score, class_score, context_score, final_confidence } = candidate;

  const getDecisionBadge = (score: number) => {
    if (score >= thresholds.auto_link_threshold) {
      return {
        label: 'AUTO-LINK (HIGH CONFIDENCE)',
        bg: 'bg-emerald-500 text-white',
        border: 'border-emerald-600',
        desc: 'Confidence >= 90%. Instantly committed to Master Academic Plan.',
      };
    } else if (score >= thresholds.review_threshold) {
      return {
        label: 'HUMAN REVIEW REQUIRED (MEDIUM CONFIDENCE)',
        bg: 'bg-amber-500 text-white',
        border: 'border-amber-600',
        desc: 'Confidence 50-89%. Routed to Coordinator queue for verification.',
      };
    } else {
      return {
        label: 'UNMATCHED ACTIVITY (LOW CONFIDENCE)',
        bg: 'bg-purple-600 text-white',
        border: 'border-purple-700',
        desc: 'Confidence < 50%. Out-of-syllabus or non-standard activity.',
      };
    }
  };

  const decision = getDecisionBadge(final_confidence);

  const metrics = [
    {
      label: 'Semantic Similarity',
      weight: `${Math.round(thresholds.weights.semantic * 100)}%`,
      score: semantic_score,
      color: 'bg-blue-600',
      calc: `0.55 × ${semantic_score} = ${(thresholds.weights.semantic * semantic_score).toFixed(1)}`,
    },
    {
      label: 'Course & Subject Match',
      weight: `${Math.round(thresholds.weights.course * 100)}%`,
      score: course_score,
      color: 'bg-indigo-600',
      calc: `0.20 × ${course_score} = ${(thresholds.weights.course * course_score).toFixed(1)}`,
    },
    {
      label: 'Class / Section Match',
      weight: `${Math.round(thresholds.weights.class * 100)}%`,
      score: class_score,
      color: 'bg-cyan-600',
      calc: `0.15 × ${class_score} = ${(thresholds.weights.class * class_score).toFixed(1)}`,
    },
    {
      label: 'Date & Context Continuity',
      weight: `${Math.round(thresholds.weights.context * 100)}%`,
      score: context_score,
      color: 'bg-violet-600',
      calc: `0.10 × ${context_score} = ${(thresholds.weights.context * context_score).toFixed(1)}`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Confidence Decision Engine
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Multi-factor weighted academic execution scoring
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{final_confidence}%</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Confidence
          </span>
        </div>
      </div>

      {/* Decision Banner */}
      <div className={`p-4 rounded-xl shadow-sm border ${decision.border} ${decision.bg} text-white`}>
        <div className="flex items-center justify-between font-bold text-xs">
          <span>{decision.label}</span>
          <span className="text-xs font-mono font-black">{final_confidence}%</span>
        </div>
        <p className="text-xs text-white/90 mt-1 font-medium">{decision.desc}</p>
      </div>

      {/* Weighted Formula Visualizer */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 leading-relaxed">
        <div className="font-bold text-slate-800 mb-1">Mathematical Formula:</div>
        <div className="text-slate-600">
          Confidence = (0.55 × Semantic) + (0.20 × Course) + (0.15 × Class) + (0.10 × Context)
        </div>
      </div>

      {/* Sub-factors Breakdown */}
      <div className="space-y-3.5">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {m.label}{' '}
                <span className="text-[10px] font-medium text-slate-400">
                  (Weight: {m.weight})
                </span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500">{m.calc}</span>
                <span className="font-bold text-slate-800 w-8 text-right">{m.score}%</span>
              </div>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} transition-all duration-500 rounded-full`}
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Match Explanation */}
      <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700">
        <span className="font-bold text-blue-900 block mb-0.5">Semantic Rationale:</span>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          {candidate.match_explanation}
        </p>
      </div>
    </div>
  );
};
