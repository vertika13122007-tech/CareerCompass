import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Library | CareerCompass',
  description: 'Manage your multi-resume portfolio.',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
