import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Roadmap | CareerCompass',
  description: 'Interactive growth timelines and career milestones.',
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
