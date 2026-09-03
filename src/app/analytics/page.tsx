'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AnalyticsKpiCards } from '../../components/analytics/AnalyticsKpiCards';
import { DeviationBarChart } from '../../components/analytics/DeviationBarChart';
import { TopDelayedTopicsTable } from '../../components/analytics/TopDelayedTopicsTable';

export default function AnalyticsPage() {
  return (
    <MainLayout
      title="Analytics & Deviation Intelligence"
      subtitle="Institutional schedule variance tracking, delay clustering, and course progress indicators"
    >
      <div className="space-y-6">
        <AnalyticsKpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviationBarChart />
          <TopDelayedTopicsTable />
        </div>
      </div>
    </MainLayout>
  );
}
