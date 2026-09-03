'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Calendar,
  Send,
  Save,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FacultyExecutionForm: React.FC = () => {
  const router = useRouter();
  const { submitExecutionReport, showNotification } = useApp();

  const [course, setCourse] = useState('Database Management Systems');
  const [unitTopic, setUnitTopic] = useState('Unit 2: ER Model');
  const [plannedDate, setPlannedDate] = useState('2025-08-16');
  const [actualDate, setActualDate] = useState('2025-08-18');
  const [executedContent, setExecutedContent] = useState('ER Model, Constraints, Weak Entities, Examples');
  const [deliveryMode, setDeliveryMode] = useState('Classroom');
  const [resourcesUsed, setResourcesUsed] = useState('PPT, Whiteboard');
  const [remarks, setRemarks] = useState('Students understood well. More examples discussed.');
  const [classSection, setClassSection] = useState('CSE-A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!executedContent.trim()) {
      showNotification('Please enter executed topics or content', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const event = submitExecutionReport({
        course,
        unit_topic: unitTopic,
        planned_date: plannedDate,
        actual_date: actualDate,
        raw_content: executedContent,
        delivery_mode: deliveryMode,
        resources_used: resourcesUsed,
        remarks,
        class_section: classSection,
      });

      setIsSubmitting(false);

      // Route based on AI decision
      if (event.status === 'AUTO_LINKED') {
        router.push('/ai-matching');
      } else if (event.status === 'REVIEW_REQUIRED') {
        router.push('/review-queue');
      } else {
        router.push('/unmatched');
      }
    }, 400);
  };

  const handleSaveDraft = () => {
    showNotification('Execution report saved as draft locally.', 'info');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Header / Breadcrumbs */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span>/</span>
          <span>Execution Tracking</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Add Execution</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Ingestion Active
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Row 1: Course & Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Course
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="Database Management Systems">Database Management Systems</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Career Readiness & Soft Skills">Career Readiness & Soft Skills</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Unit / Topic
            </label>
            <input
              type="text"
              value={unitTopic}
              onChange={(e) => setUnitTopic(e.target.value)}
              placeholder="e.g. Unit 2: ER Model or Unit III: Linked Lists"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Row 2: Planned Date, Actual Date & Class Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Planned Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Actual Execution Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Class / Section
            </label>
            <select
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
              <option value="CSE-C">CSE-C</option>
              <option value="CSE-All">CSE-All</option>
            </select>
          </div>
        </div>

        {/* Row 3: Executed Content with Rich Formatting Toolbar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Executed Content (Topics Covered)
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Freeform or bulleted faculty log
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            {/* Formatting Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1 text-slate-600">
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs font-bold" title="Bold">
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Italic">
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Underline">
                <Underline className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1" />
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Bullet List">
                <List className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Numbered List">
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-slate-300 mx-1" />
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Insert Code">
                <Code className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Link">
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:bg-slate-200 rounded text-xs" title="Table">
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              rows={4}
              value={executedContent}
              onChange={(e) => setExecutedContent(e.target.value)}
              placeholder="e.g. Finished linked lists today for CSE-C. Covered singly and doubly linked list node insertions."
              className="w-full p-4 text-xs font-medium text-slate-800 placeholder-slate-400 bg-white focus:outline-none resize-y"
            />
          </div>
        </div>

        {/* Row 4: Delivery Mode & Resources Used */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Delivery Mode
            </label>
            <select
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Seminar">Seminar</option>
              <option value="Workshop">Workshop</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Resources Used
            </label>
            <input
              type="text"
              value={resourcesUsed}
              onChange={(e) => setResourcesUsed(e.target.value)}
              placeholder="e.g. PPT, Whiteboard, PostgreSQL Lab"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Row 5: Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Remarks (Optional)
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Students understood well. More examples discussed."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 rounded-xl transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Processing via AI Engine...' : 'Submit Execution'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
