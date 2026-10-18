import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Pipeline | CareerCompass',
  description: 'Track and manage your active job applications.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
