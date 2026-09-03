'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  FileSpreadsheet,
  GitCompare,
  BrainCircuit,
  Inbox,
  AlertTriangle,
  Layers,
  BarChart3,
  History,
  Bot,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { reviewQueue, unmatchedQueue, showNotification } = useApp();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Academic Plans', href: '/plans', icon: CalendarCheck2 },
    { label: 'Execution Tracking', href: '/execution', icon: FileSpreadsheet },
    { label: 'Plan vs Execution', href: '/plan-vs-execution', icon: GitCompare },
    { label: 'AI Extraction & Match', href: '/ai-matching', icon: BrainCircuit, highlight: true },
    {
      label: 'Human Review Queue',
      href: '/review-queue',
      icon: Inbox,
      badge: reviewQueue.length > 0 ? reviewQueue.length : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      label: 'Unmatched Activities',
      href: '/unmatched',
      icon: AlertTriangle,
      badge: unmatchedQueue.length > 0 ? unmatchedQueue.length : undefined,
      badgeColor: 'bg-purple-500 text-white'
    },
    { label: 'Granularity View', href: '/granularity', icon: Layers },
    { label: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { label: 'Institutional Memory', href: '/institutional-memory', icon: History },
    { label: 'AI Co-Pilot', href: '/copilot', icon: Bot, isAi: true },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Audit Trail', href: '/audit-trail', icon: ShieldCheck },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    showNotification('Logged out successfully', 'info');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">Academic<span className="text-blue-400">Flow</span></span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Execution Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Core Workflows
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-white' : item.isAi ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.isAi && (
                  <span className="flex items-center gap-0.5 text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                    <Sparkles className="w-2.5 h-2.5" /> RAG
                  </span>
                )}
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/90 bg-[#080F1E]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow">
              DR
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">Dr. R. Sharma</h4>
              <p className="text-[11px] text-slate-400 truncate">HOD - CSE</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
