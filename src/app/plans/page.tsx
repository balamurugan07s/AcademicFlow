'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { HierarchyBreadcrumb } from '../../components/plans/HierarchyBreadcrumb';
import { PlanTable } from '../../components/plans/PlanTable';

export default function PlansPage() {
  return (
    <MainLayout
      title="Master Academic Execution Plans"
      subtitle="Hierarchical academic activity roadmap (L1 Semester → L6 Executable Session)"
    >
      <div className="space-y-6">
        <HierarchyBreadcrumb />
        <PlanTable />
      </div>
    </MainLayout>
  );
}
