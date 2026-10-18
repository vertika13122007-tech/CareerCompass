import type { Metadata } from 'next';
import { DashboardShell } from './dashboard-shell';

export const metadata: Metadata = {
  title: 'Overview | CareerCompass',
  description: 'Your AI-powered career command center.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}