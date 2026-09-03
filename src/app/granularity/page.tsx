'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { GranularityReconciliationView } from '../../components/granularity/GranularityReconciliationView';

export default function GranularityPage() {
  return (
    <MainLayout
      title="Granularity Reconciliation"
      subtitle="Support multiple micro-execution events mapping seamlessly into one planned academic activity"
    >
      <div className="space-y-6">
        <GranularityReconciliationView />
      </div>
    </MainLayout>
  );
}
