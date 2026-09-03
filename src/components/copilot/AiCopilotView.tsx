'use client';

import React, { useState } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CopilotMessage } from '../../types';

export const AiCopilotView: React.FC = () => {
  const { activities, auditLogs, documents } = useApp();

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      content: 'What was the planned topic for Unit 3 in DBMS?',
      timestamp: '10:45 AM',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      content:
        'The planned topic for Unit 3 in Database Management Systems was "Relational Model, Keys" with a planned start date of 31 Aug 2025.',
      timestamp: '10:45 AM',
      sources: [
        {
          document_name: 'DBMS Plan (Odd Sem 2025-26).pdf',
          section: 'Section 3.1: Relational Model Specifications',
          snippet: 'Planned: Relational Model, Keys, Integrity Constraints (Target: 31 Aug 2025)',
        },
      ],
      structured_data: {
        course: 'Database Management Systems',
        unit: 'Unit 3: Relational Model',
        planned_date: '31 Aug 2025',
        actual_date: '03 Sep 2025 (+3 Days Delay)',
        status: 'Completed',
      },
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'What was the planned topic for Unit 3 in DBMS?',
    'Show deviation for DBMS',
    "What's left in the plan?",
    'Generate execution summary',
    'List overdue plans',
    'Show documents for AICTE activity',
  ];

  const handleSend = (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let replyContent = '';
      let sources: CopilotMessage['sources'] = [];
      let structured_data: any = null;

      const lower = text.toLowerCase();

      if (lower.includes('unit 3') && lower.includes('dbms')) {
        replyContent =
          'The planned topic for Unit 3 in Database Management Systems was "Relational Model, Keys" with a planned date of 31 Aug 2025. It was executed on 03 Sep 2025 with a deviation of +3 Days.';
        sources = [
          {
            document_name: 'DBMS_Plan_Odd_Sem_2025-26.pdf',
            section: 'Unit 3: Relational Model & Keys',
            snippet: 'Activity: Relational Model, Keys, Integrity Constraints, Relational Algebra',
          },
        ];
      } else if (lower.includes('deviation') && lower.includes('dbms')) {
        replyContent =
          'DBMS Course Schedule Deviation Analysis:\n• Unit 1 (DBMS Concepts): On Track (0 Days)\n• Unit 2 (ER Model): Completed with +2 Days delay\n• Unit 3 (Relational Model): Completed with +3 Days delay\n• Unit 4 (SQL Basics): In Progress (On Track)\n• Unit 5 & 6: Not Started';
        sources = [
          {
            document_name: 'Institutional_Master_Calendar_2025_26.pdf',
            section: 'CSE Execution Variance Log',
            snippet: 'Cumulative course deviation for DBMS: +5 Days total',
          },
        ];
      } else if (lower.includes('left in the plan') || lower.includes("what's left")) {
        replyContent =
          'Upcoming unexecuted units in the current semester:\n1. DBMS Unit 5: Complex Queries & Joins (Planned 30 Sep 2025)\n2. DBMS Unit 6: Normalization (Planned 15 Oct 2025)\n3. Career Readiness: Quantitative Aptitude Unit (Planned 20 Sep 2026)\n4. OS Unit 2: Process Scheduling (Overdue)';
      } else if (lower.includes('aicte')) {
        replyContent =
          'Found 1 mandatory compliance document for AICTE activities: "AICTE_Mandatory_Execution_Report_Q1.pdf" uploaded on 20 Aug 2026 by Academic Coordinator. 100% of community and laboratory credits accounted for.';
        sources = [
          {
            document_name: 'AICTE_Mandatory_Execution_Report_Q1.pdf',
            section: 'Compliance Executive Summary',
            snippet: 'Mandatory 100 activity points progress logged under CSE Department.',
          },
        ];
      } else if (lower.includes('overdue')) {
        replyContent =
          'Currently flagged overdue activities:\n• CSE-OS-L5-0017: CPU Scheduling Algorithms (Operating Systems, Dr. M. Kulkarni) — Planned start was 10 Aug 2026 (12 days overdue).';
      } else {
        replyContent = `Execution Intelligence Search Result for "${text}": Synthesized from ${activities.length} active syllabus plans and ${auditLogs.length} verified faculty execution logs. Data indicates 67% overall completion across the department.`;
        sources = [
          {
            document_name: 'Master_Academic_Plan_2025-26.pdf',
            section: 'Departmental Index',
            snippet: 'Reconciled AI execution records for CSE department.',
          },
        ];
      }

      const assistantMsg: CopilotMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        structured_data,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Chat Window (2 Cols) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                AcademicFlow AI Co-Pilot
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold">
                  RAG Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Grounded in master course plans, syllabi & verified execution logs
              </p>
            </div>
          </div>

          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Grounded Context
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-blue-400 border border-slate-800'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Sources reference box matching UI Mockup 5 */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-[11px]">
                        <span className="font-bold text-slate-600 block">Sources:</span>
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-between"
                          >
                            <span className="font-semibold text-blue-700 hover:underline cursor-pointer flex items-center gap-1">
                              • {src.document_name}
                            </span>
                            <span className="text-[10px] text-slate-400">{src.section}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] text-slate-400 block px-1 ${isUser ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>Searching course plans & synthesizing response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips matching Mockup 5 */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {suggestedQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-3 py-1 rounded-full whitespace-nowrap transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about plans, execution, deviations..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Suggested Questions & RAG Documents (1 Col) */}
      <div className="space-y-5">
        {/* Suggested Questions Panel matching Mockup 5 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Suggested Questions
          </h4>

          <div className="space-y-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-slate-800 hover:text-blue-700 transition-all flex items-center justify-between group"
              >
                <span>{idx + 1}. {q}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Grounding Knowledge Documents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              RAG Knowledge Index
            </h4>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {documents.length} Indexed
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{doc.file_name}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{doc.file_size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
