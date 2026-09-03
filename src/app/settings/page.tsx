'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { SettingsView } from '../../components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <MainLayout
      title="Settings & System Configuration"
      subtitle="AI decision parameters, confidence thresholds, RBAC profiles, and calendar configurations"
    >
      <div className="space-y-6">
        <SettingsView />
      </div>
    </MainLayout>
  );
}
