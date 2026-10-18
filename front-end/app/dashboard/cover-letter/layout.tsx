import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cover Letter Generator | CareerCompass',
  description: 'Draft high-converting cover letters instantly.',
};

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
