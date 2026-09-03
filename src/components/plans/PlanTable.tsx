'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Eye, CheckCircle2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { AcademicActivity } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate, getStatusBadgeClass } from '../../lib/utils';
import { PlanDetailModal } from './PlanDetailModal';

export const PlanTable: React.FC = () => {
  const { activities } = useApp();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState<AcademicActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courses = useMemo(() => {
    const list = Array.from(new Set(activities.map((a) => a.course)));
    return ['All', ...list];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.activity_id.toLowerCase().includes(search.toLowerCase()) ||
        act.activity_name.toLowerCase().includes(search.toLowerCase()) ||
        act.faculty.toLowerCase().includes(search.toLowerCase()) ||
        act.unit.toLowerCase().includes(search.toLowerCase()) ||
        act.class_section.toLowerCase().includes(search.toLowerCase());

      const matchCourse = courseFilter === 'All' || act.course === courseFilter;
      const matchStatus = statusFilter === 'All' || act.status === statusFilter;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [activities, search, courseFilter, statusFilter]);

  const handleOpenDetail = (act: AcademicActivity) => {
    setSelectedActivity(act);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Controls / Filter Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Activity ID (e.g. CSE-DSA-L5-0042), Topic, Faculty, Class..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenDetail(activities[0])}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Activity ID</th>
              <th className="py-3.5 px-4">Activity Name / Syllabus Topic</th>
              <th className="py-3.5 px-3">Course</th>
              <th className="py-3.5 px-3">Unit</th>
              <th className="py-3.5 px-3">Type</th>
              <th className="py-3.5 px-3">Faculty</th>
              <th className="py-3.5 px-2">Class</th>
              <th className="py-3.5 px-3">Planned Start</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No academic plans match the current filters.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act) => {
                const badge = getStatusBadgeClass(act.status);
                const isTargetDemo = act.activity_id === 'CSE-DSA-L5-0042';

                return (
                  <tr
                    key={act.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isTargetDemo ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{act.activity_id}</span>
                        {isTargetDemo && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {act.activity_name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {act.course}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {act.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {act.activity_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {act.faculty}
                    </td>
                    <td className="py-3 px-2 font-bold text-blue-700">
                      {act.class_section}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(act.planned_start)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(act)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="View Detailed Hierarchy & Execution"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Showing {filteredActivities.length} of {activities.length} planned activities</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Auto-reconciled with AI Engine
          </span>
        </div>
      </div>

      {/* Details Modal */}
      <PlanDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
