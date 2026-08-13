import type { Metadata } from 'next';
import './globals.css'; // This imports Tailwind!

export const metadata: Metadata = {
  title: 'CareerCompass AI',
  description: 'AI-powered resume analysis and career coaching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 bg-white">
        {/* This renders whatever is inside page.tsx */}
        {children}
      </body>
    </html>
  );
}