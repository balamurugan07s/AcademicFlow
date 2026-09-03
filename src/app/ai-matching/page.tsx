'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AiPipelineVisualizer } from '../../components/ai/AiPipelineVisualizer';
import { ExtractionResultCard } from '../../components/ai/ExtractionResultCard';
import { ConfidenceBreakdownCard } from '../../components/ai/ConfidenceBreakdownCard';
import { DemoScenariosBar } from '../../components/execution/DemoScenariosBar';
import { useApp } from '../../context/AppContext';

export default function AiMatchingPage() {
  const { activeEvent, thresholds } = useApp();

  return (
    <MainLayout
      title="AI Semantic Extraction & Matching Engine"
      subtitle="The AcademicFlow intelligence core: Ingestion → Normalization → Multi-Factor Scoring → Decision"
    >
      <div className="space-y-6">
        <DemoScenariosBar />
        <AiPipelineVisualizer activeStep={activeEvent ? 7 : 4} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExtractionResultCard event={activeEvent} />
          <ConfidenceBreakdownCard
            candidate={activeEvent?.candidates[0]}
            thresholds={thresholds}
          />
        </div>
      </div>
    </MainLayout>
  );
}
