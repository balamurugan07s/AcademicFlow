'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { ReviewQueueView } from '../../components/review/ReviewQueueView';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';

export default function ReviewQueuePage() {
  return (
    <MainLayout
      title="Human Review Queue"
      subtitle="Coordinated verification for medium-confidence candidate matches (50% – 89%)"
    >
      <div className="space-y-6">
        <DemoScenariosBar />
        <ReviewQueueView />
      </div>
    </MainLayout>
  );
}
