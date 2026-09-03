'use client';

import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, CheckCircle2, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { reviewQueue, unmatchedQueue, notification, dismissNotification } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('Odd Semester 2025-26');

  const totalAlerts = reviewQueue.length + unmatchedQueue.length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
      {/* Left Title / Breadcrumb */}
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>
        )}

        {/* Global Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans, activities, faculty, topics..."
            className="w-72 lg:w-96 pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Semester / Date Badge Filter */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>01 Aug 2025 - 31 Jan 2026</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">ODD</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Execution Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {totalAlerts} Pending
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {reviewQueue.length > 0 && (
                  <Link
                    href="/review-queue"
                    onClick={() => setShowNotifications(false)}
                    className="p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors block"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {reviewQueue.length} Activity in Review Queue
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Medium confidence match requires coordinator verification.
                      </p>
                    </div>
                  </Link>
                )}

                {unmatchedQueue.length > 0 && (
                  <Link
                    href="/unmatched"
                    onClick={() => setShowNotifications(false)}
                    className="p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors block"
                  >
                    <AlertCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {unmatchedQueue.length} Unmatched Execution Report
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Aptitude workshop lacks standard syllabus target.
                      </p>
                    </div>
                  </Link>
                )}

                <div className="p-3 flex items-start gap-2.5 bg-emerald-50/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      AI Engine Online & Active
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Confidence threshold at 90% auto-link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            DR
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Dr. R. Sharma</p>
            <p className="text-[10px] text-slate-500 font-medium">HOD - CSE</p>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 transition-all animate-in slide-in-from-bottom-3 ${
          notification.type === 'success'
            ? 'bg-emerald-900 text-white border-emerald-700'
            : notification.type === 'warning'
            ? 'bg-amber-900 text-white border-amber-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}>
          <div className="shrink-0">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <p className="text-xs font-medium pr-2">{notification.message}</p>
          <button
            onClick={dismissNotification}
            className="text-white/60 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
