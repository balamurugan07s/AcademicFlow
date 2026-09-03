'use client';

import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Sparkles, UserCheck, XCircle, FileCode, CheckCircle2, Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';
import { AuditLog } from '../../types';

export const AuditTrailTable: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.event_id.toLowerCase().includes(search.toLowerCase()) ||
      log.source_excerpt.toLowerCase().includes(search.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(search.toLowerCase()) ||
      (log.activity_id && log.activity_id.toLowerCase().includes(search.toLowerCase()));

    const matchFilter = decisionFilter === 'All' || log.decision_type === decisionFilter;

    return matchSearch && matchFilter;
  });

  const getBadge = (type: string) => {
    switch (type) {
      case 'AUTO_LINKED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HUMAN_CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'HUMAN_REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MANUALLY_MAPPED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header & Filter Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Event ID, Source Excerpt, Faculty, Target Plan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Decision Type:</span>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Decisions</option>
            <option value="AUTO_LINKED">AUTO_LINKED</option>
            <option value="HUMAN_CONFIRMED">HUMAN_CONFIRMED</option>
            <option value="HUMAN_REJECTED">HUMAN_REJECTED</option>
            <option value="MANUALLY_MAPPED">MANUALLY_MAPPED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Event ID</th>
              <th className="py-3.5 px-4 max-w-xs">Source Report Excerpt</th>
              <th className="py-3.5 px-3">Extracted Topic</th>
              <th className="py-3.5 px-3">Target Plan ID</th>
              <th className="py-3.5 px-3">Confidence</th>
              <th className="py-3.5 px-3">Decision Type</th>
              <th className="py-3.5 px-3">Authorized By</th>
              <th className="py-3.5 px-3">Timestamp</th>
              <th className="py-3.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No audit logs match current filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.event_id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-800">
                    <p className="line-clamp-2 italic font-mono text-[11px] text-slate-600">
                      “{log.source_excerpt}”
                    </p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {log.extracted_data.activity}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {log.activity_id || '—'}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{log.confidence_score}%</span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getBadge(log.decision_type)}`}>
                      {log.decision_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                    {log.performed_by}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Inspect Audit Proof"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Immutable Audit Trail • <strong>{auditLogs.length} Records Verified</strong></span>
        <span className="text-slate-400">Cryptographically Signed Academic Ledger</span>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1528] text-white p-5 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-300 font-bold block mb-1">
                  Audit Record: {selectedLog.id}
                </span>
                <h4 className="text-base font-bold">Execution Verification Proof</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Source Report</span>
                <p className="font-mono text-slate-800 text-xs">“{selectedLog.source_excerpt}”</p>
                <p className="text-[10px] text-slate-400">Source: {selectedLog.source}</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-blue-900 font-bold uppercase text-[10px] block">AI Decision Rationale</span>
                <p className="text-slate-800 font-semibold">{selectedLog.decision}</p>
                <p className="text-[11px] text-slate-600">Decision Type: <strong>{selectedLog.decision_type}</strong></p>
              </div>

              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Close Proof Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
