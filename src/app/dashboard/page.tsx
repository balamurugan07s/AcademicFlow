'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { KpiCards } from '../../components/dashboard/KpiCards';
import { ExecutionOverviewChart } from '../../components/dashboard/ExecutionOverviewChart';
import { RecentActivities } from '../../components/dashboard/RecentActivities';
import { MyTasks } from '../../components/dashboard/MyTasks';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';

export default function DashboardPage() {
  return (
    <MainLayout
      title="Welcome, Dr. R. Sharma 👋"
      subtitle="Here's what's happening in your department."
    >
      <div className="space-y-6">
        {/* Interactive Demo Trigger Bar for Judges / Presentation */}
        <DemoScenariosBar />

        {/* 4 Core KPI Cards */}
        <KpiCards />

        {/* Mid Section: Execution Overview Donut Chart & My Actionable Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExecutionOverviewChart />
          <MyTasks />
        </div>

        {/* Bottom Section: Recent Execution Activities Feed */}
        <div className="grid grid-cols-1 gap-6">
          <RecentActivities />
        </div>
      </div>
    </MainLayout>
  );
}
