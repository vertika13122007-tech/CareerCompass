import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Coach Kiki | CareerCompass',
  description: 'Mock interviews and executive career advice.',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
