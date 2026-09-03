'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { FacultyExecutionForm } from '../../components/execution/FacultyExecutionForm';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';

export default function ExecutionPage() {
  return (
    <MainLayout
      title="Execution Tracking & Reporting"
      subtitle="Frictionless faculty session reporting with real-time NLP ingestion"
    >
      <div className="space-y-6">
        <DemoScenariosBar />
        <FacultyExecutionForm />
      </div>
    </MainLayout>
  );
}
