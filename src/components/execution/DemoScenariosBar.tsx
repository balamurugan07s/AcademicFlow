'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, AlertCircle, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoScenariosBar: React.FC = () => {
  const router = useRouter();
  const { triggerDemoPreset, setActiveEvent } = useApp();

  const handleDemo1 = () => {
    const event = triggerDemoPreset('high_linked_lists');
    setActiveEvent(event);
    router.push('/ai-matching');
  };

  const handleDemo2 = () => {
    const event = triggerDemoPreset('medium_sql');
    setActiveEvent(event);
    router.push('/review-queue');
  };

  const handleDemo3 = () => {
    const event = triggerDemoPreset('low_placement');
    setActiveEvent(event);
    router.push('/unmatched');
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-blue-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">SIH 2026 Interactive Demonstration Panel</h3>
            <p className="text-[11px] text-slate-300">Test the 3 core AI extraction & confidence branching decisions instantly</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
          Ready for evaluation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {/* Scenario 1 */}
        <button
          onClick={handleDemo1}
          className="text-left p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> High Conf (94%)
              </span>
              <span className="text-[10px] font-bold text-emerald-400">AUTO-LINK</span>
            </div>
            <p className="text-xs font-bold text-white group-hover:text-blue-200">
              “Finished linked lists today for CSE-C.”
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Extracts DSA topic, matches <em>CSE-DSA-L5-0042</em>, updates plan directly.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-300 font-semibold">
            <span>Run High-Conf Flow</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={handleDemo2}
          className="text-left p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Med Conf (78%)
              </span>
              <span className="text-[10px] font-bold text-amber-400">HUMAN REVIEW</span>
            </div>
            <p className="text-xs font-bold text-white group-hover:text-amber-200">
              “Did SQL practice today.”
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Ambiguous between Lab, Tutorial & Practice. Routes to Coordinator Queue.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
            <span>Run Review Queue Flow</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={handleDemo3}
          className="text-left p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400/40 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Low Conf (38%)
              </span>
              <span className="text-[10px] font-bold text-purple-400">UNMATCHED</span>
            </div>
            <p className="text-xs font-bold text-white group-hover:text-purple-200">
              “Conducted placement aptitude training.”
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Not in regular syllabus. Offers manual map or create extra co-curricular.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300 font-semibold">
            <span>Run Unmatched Flow</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
