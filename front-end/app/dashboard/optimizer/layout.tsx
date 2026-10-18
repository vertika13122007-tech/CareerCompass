import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Optimizer | CareerCompass',
  description: 'Tailor your resume against target job descriptions.',
};

export default function OptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
