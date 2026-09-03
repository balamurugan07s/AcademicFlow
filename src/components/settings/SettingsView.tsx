'use client';

import React, { useState } from 'react';
import { Settings, Sliders, Shield, Bell, User, Sparkles, RotateCcw, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfidenceThresholds } from '../../types';

export const SettingsView: React.FC = () => {
  const { thresholds, updateThresholds, resetDemoData, userRole, setUserRole, showNotification } = useApp();

  const [autoThreshold, setAutoThreshold] = useState(thresholds.auto_link_threshold);
  const [reviewThreshold, setReviewThreshold] = useState(thresholds.review_threshold);
  const [semanticWeight, setSemanticWeight] = useState(thresholds.weights.semantic);
  const [courseWeight, setCourseWeight] = useState(thresholds.weights.course);
  const [classWeight, setClassWeight] = useState(thresholds.weights.class);
  const [contextWeight, setContextWeight] = useState(thresholds.weights.context);

  const roles = ['HOD', 'COORDINATOR', 'FACULTY', 'LAB_STAFF', 'ADMIN'];

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ConfidenceThresholds = {
      auto_link_threshold: autoThreshold,
      review_threshold: reviewThreshold,
      weights: {
        semantic: semanticWeight,
        course: courseWeight,
        class: classWeight,
        context: contextWeight,
      },
    };
    updateThresholds(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Institutional Configuration & AI Parameters
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Fine-tune confidence decision boundaries, user roles, and execution intelligence parameters.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Sandbox</span>
        </button>
      </div>

      {/* Role Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Role-Based Access Control (RBAC Simulation)
        </h4>

        <div className="flex flex-wrap items-center gap-2.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setUserRole(r);
                showNotification(`Role switched to ${r}`, 'info');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                userRole === r
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Current simulated session: <strong>Dr. R. Sharma ({userRole} — CSE Department)</strong>
        </p>
      </div>

      {/* AI Decision Thresholds */}
      <form onSubmit={handleSaveThresholds} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            AI Confidence Thresholds & Weighted Scoring Rules
          </h4>
          <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
            Configurable Weights
          </span>
        </div>

        {/* Sliders for Auto-Link & Review thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950">
                Auto-Link Threshold (High Confidence)
              </label>
              <span className="text-sm font-black text-emerald-700">{autoThreshold}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="98"
              value={autoThreshold}
              onChange={(e) => setAutoThreshold(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-emerald-800">
              Matches above this score bypass manual review and update the academic plan immediately.
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950">
                Human Review Threshold (Medium Confidence)
              </label>
              <span className="text-sm font-black text-amber-700">{reviewThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="70"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-amber-800">
              Matches between {reviewThreshold}% and {autoThreshold}% are routed to the Coordinator Review Queue.
            </p>
          </div>
        </div>

        {/* Weights Breakdown */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-700">
            Multi-Factor Scoring Weights (Sum = 1.00)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Semantic Weight</span>
              <p className="text-sm font-black text-blue-700">55%</p>
              <p className="text-[10px] text-slate-400">0.55 × NLP Embeddings</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Course Weight</span>
              <p className="text-sm font-black text-indigo-700">20%</p>
              <p className="text-[10px] text-slate-400">0.20 × Syllabus Match</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Class Section</span>
              <p className="text-sm font-black text-cyan-700">15%</p>
              <p className="text-[10px] text-slate-400">0.15 × Section Match</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700">Context & Date</span>
              <p className="text-sm font-black text-violet-700">10%</p>
              <p className="text-[10px] text-slate-400">0.10 × Calendar Match</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 rounded-xl transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
