'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { UnmatchedActivityView } from '../../components/review/UnmatchedActivityView';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';

export default function UnmatchedPage() {
  return (
    <MainLayout
      title="Unmatched Activities Workflow"
      subtitle="Guaranteed zero data loss: Manual mapping, extra co-curricular activity conversion, or scope flagging"
    >
      <div className="space-y-6">
        <DemoScenariosBar />
        <UnmatchedActivityView />
      </div>
    </MainLayout>
  );
}
