'use client';

import React, { useState } from 'react';
import { FileText, Upload, Download, Eye, Plus, CheckCircle2, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';
import { AcademicDocument } from '../../types';

export const DocumentsView: React.FC = () => {
  const { documents, showNotification } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.category.toLowerCase().includes(search.toLowerCase());

    const matchCat = categoryFilter === 'All' || doc.category === categoryFilter;

    return matchSearch && matchCat;
  });

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showNotification('Document uploaded & indexed into AI Co-Pilot RAG pipeline!', 'success');
    }, 1000);
  };

  const handleDownload = (fileName: string) => {
    showNotification(`Downloading ${fileName}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Institutional Academic Document Vault
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of course syllabi, lab manuals, AICTE compliance plans, and faculty semester reports.
          </p>
        </div>

        <button
          onClick={handleSimulatedUpload}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 rounded-xl transition-all disabled:opacity-50 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Indexing Document...' : 'Upload Academic File'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search document title, syllabus name, file..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Academic Plan">Academic Plan</option>
            <option value="Course Plan">Course Plan</option>
            <option value="Lab Schedule">Lab Schedule</option>
            <option value="AICTE Report">AICTE Report</option>
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {doc.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Indexed
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                {doc.title}
              </h4>

              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1 font-mono">
                <p className="truncate font-semibold text-slate-800">📄 {doc.file_name}</p>
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Size: {doc.file_size}</span>
                  <span>Ver: {doc.version}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                {formatDate(doc.upload_date)} by {doc.uploaded_by.split(' ')[0]}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(doc.file_name)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
