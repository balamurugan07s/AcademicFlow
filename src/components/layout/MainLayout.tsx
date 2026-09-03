'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Persistent Left Dark Blue Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
