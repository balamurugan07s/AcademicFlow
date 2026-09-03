'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { PlanVsExecutionTable } from '../../components/plan-vs-execution/PlanVsExecutionTable';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';

export default function PlanVsExecutionPage() {
  return (
    <MainLayout
      title="Plan vs Execution View"
      subtitle="Side-by-side syllabus reconciliation, delivery dates, and schedule deviation"
    >
      <div className="space-y-6">
        <DemoScenariosBar />
        <PlanVsExecutionTable />
      </div>
    </MainLayout>
  );
}
