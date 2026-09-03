'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { InstitutionalMemoryView } from '../../components/institutional-memory/InstitutionalMemoryView';

export default function InstitutionalMemoryPage() {
  return (
    <MainLayout
      title="Institutional Memory & Variance Intelligence"
      subtitle="Historical analytics comparing planned curriculum allocations against empirical multi-semester execution logs"
    >
      <div className="space-y-6">
        <InstitutionalMemoryView />
      </div>
    </MainLayout>
  );
}
