import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'AcademicFlow — AI-Powered Academic Execution Intelligence',
  description: 'Bridging the Gap Between Academic Plans and Actual Execution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-[#F8FAFC]">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
