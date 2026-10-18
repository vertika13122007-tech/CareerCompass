import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | CareerCompass',
  description: 'The requested page could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3A2F] flex flex-col items-center justify-center p-6 selection:bg-[#EAF0EB]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Decorative Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#EAF0EB] text-[#52795C] shadow-sm mb-2">
          <Compass className="w-10 h-10 animate-spin-slow stroke-[1.75]" />
        </div>

        {/* Heading & Code */}
        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest uppercase text-[#52795C] bg-[#F5F3EC] px-3.5 py-1.5 rounded-full border border-[#EAF0EB]">
            Error 404
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2D3A2F] tracking-tight pt-2">
            Page Not Found
          </h1>
          <p className="text-[#5C665D] text-base leading-relaxed pt-1">
            Looks like you&apos;ve wandered off the career roadmap. The page you&apos;re looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#52795C] hover:bg-[#3b5943] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F5F3EC] text-[#2D3A2F] font-bold text-sm border-2 border-[#EAF0EB] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#5C665D]" />
            <span>Back Home</span>
          </Link>
        </div>

        {/* Footer Brand Note */}
        <p className="text-xs text-[#8C938D] pt-6">
          CareerCompass AI • Your AI-Powered Career Command Center
        </p>
      </div>
    </div>
  );
}
