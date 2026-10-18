import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | CareerCompass',
  description: 'Join CareerCompass to accelerate your job hunt and optimize your career.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
