'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AiCopilotView } from '../../components/copilot/AiCopilotView';

export default function CopilotPage() {
  return (
    <MainLayout
      title="AI Co-Pilot & Execution Assistant"
      subtitle="Context-grounded natural language intelligence for querying syllabus schedules, deviations & AICTE logs"
    >
      <div className="space-y-6">
        <AiCopilotView />
      </div>
    </MainLayout>
  );
}
