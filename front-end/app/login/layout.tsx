import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | CareerCompass',
  description: 'Log in to your CareerCompass command center.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
