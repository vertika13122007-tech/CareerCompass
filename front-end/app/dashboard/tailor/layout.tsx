import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tailor Resume | CareerCompass',
  description: 'Generate custom tailored resumes for target roles.',
};

export default function TailorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
