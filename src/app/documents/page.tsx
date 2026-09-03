'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { DocumentsView } from '../../components/documents/DocumentsView';

export default function DocumentsPage() {
  return (
    <MainLayout
      title="Academic Documents Repository"
      subtitle="Centralized institutional document vault indexed into AcademicFlow RAG engine"
    >
      <div className="space-y-6">
        <DocumentsView />
      </div>
    </MainLayout>
  );
}
