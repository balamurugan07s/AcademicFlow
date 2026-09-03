'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { showNotification } = useApp();

  const [email, setEmail] = useState('admin@academicflow.demo');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showNotification('Welcome back, Dr. R. Sharma!', 'success');
      router.push('/dashboard');
    }, 400);
  };

  const handleFillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Academic<span className="text-blue-600">Flow</span></span>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Execution Intelligence</p>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back!</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Sign in to access your institutional dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); showNotification('Demo password is demo123', 'info'); }} className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Quick Demo Credentials:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@academicflow.demo')}
                  className="text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                >
                  Dr. R. Sharma (HOD)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('coordinator@academicflow.demo')}
                  className="text-[10px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  Coordinator
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400 font-medium">
            Don&apos;t have an account? <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Contact Admin</span>
          </div>
        </div>

        {/* Right Side: Visual Graphic & Story Banner */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Subtle graphic shapes */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-blue-300 uppercase px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 inline-block mb-4">
              SIH 2026 Prototype
            </span>
            <h3 className="text-2xl font-black leading-tight tracking-tight">
              “Bridging the Gap Between Academic Plans and Actual Execution”
            </h3>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              AcademicFlow is an AI-powered academic execution intelligence platform. It connects institutional planned syllabi with real-world faculty execution logs.
            </p>
          </div>

          {/* Workflow Stepper in Login Preview */}
          <div className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
              Autonomous Intelligence Workflow
            </span>
            <div className="space-y-2 text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Master Academic Plan L1—L6 Hierarchy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Semantic Extraction & Multi-Factor Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-Link, Human Review & Audit Ledger</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
            <span>Powered by AcademicFlow AI Engine</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
