'use client';

import React from 'react';
import {
  FileText,
  Cpu,
  RefreshCw,
  Search,
  Sparkles,
  Percent,
  CheckCircle2,
  GitMerge,
  ArrowRight
} from 'lucide-react';

export const AiPipelineVisualizer: React.FC<{ activeStep?: number }> = ({ activeStep = 7 }) => {
  const steps = [
    { label: 'Raw Report', icon: FileText, desc: 'Faculty Log' },
    { label: 'AI Extraction', icon: Cpu, desc: 'NER & Intent' },
    { label: 'Normalization', icon: RefreshCw, desc: 'Schema Mapping' },
    { label: 'Candidate Retrieval', icon: Search, desc: 'Vector & Keyword' },
    { label: 'Semantic Matching', icon: Sparkles, desc: 'Cosine Sim' },
    { label: 'Confidence Score', icon: Percent, desc: 'Weighted Formula' },
    { label: 'Decision Engine', icon: CheckCircle2, desc: 'Auto / Review' },
    { label: 'Plan Sync', icon: GitMerge, desc: 'Audit & Analytics' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            AcademicFlow 8-Stage Execution Intelligence Pipeline
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          Fully Automated Pipeline
        </span>
      </div>

      <div className="flex items-center justify-between min-w-[720px] gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index <= activeStep;
          const isCurrent = index === activeStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100 scale-105'
                      : isComplete
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`text-[11px] font-bold mt-2 truncate ${isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-slate-400 font-medium">
                  {step.desc}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 max-w-[28px] transition-colors ${
                  index < activeStep ? 'bg-emerald-400' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
