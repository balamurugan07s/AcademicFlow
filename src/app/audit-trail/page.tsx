'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { AuditTrailTable } from '../../components/audit/AuditTrailTable';

export default function AuditTrailPage() {
  return (
    <MainLayout
      title="Audit Trail & Execution Ledger"
      subtitle="Immutable record of every AI extraction, confidence score, candidate match, and coordinator approval"
    >
      <div className="space-y-6">
        <AuditTrailTable />
      </div>
    </MainLayout>
  );
}
