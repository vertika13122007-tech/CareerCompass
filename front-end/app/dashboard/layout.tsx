'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Map,
  MessageSquare,
  Sparkles,
  FileText,
  Wand2,
  LogOut,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { AppleStyleDock } from '@/components/core/apple-style-dock';
import { ScrollProgress } from '@/components/core/scroll-progress';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Pipeline', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Upload Resume', href: '/dashboard/upload', icon: Upload },
    { name: 'Learning Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'AI Coach', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Optimizer', href: '/dashboard/optimizer', icon: Sparkles },
    { name: 'Tailor Resume', href: '/dashboard/tailor', icon: Wand2 },
    { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] text-[#2D3A2F] font-sans overflow-hidden relative">
      {/* Sleek Floating Expand Button when Sidebar is closed */}
      {mounted && !isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          title="Expand Sidebar"
          className="fixed top-5 left-5 z-30 p-2.5 rounded-2xl bg-white border border-[#EAF0EB] shadow-md hover:bg-[#F5F3EC] text-[#2D3A2F] hover:text-[#52795C] flex items-center gap-2 text-xs font-bold transition-all cursor-pointer group"
        >
          <PanelLeftOpen className="w-5 h-5 text-[#52795C] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Sidebar</span>
        </button>
      )}

      {/* Conditional Sidebar */}
      {(!mounted || isSidebarOpen) && (
        <aside className="w-72 bg-white border-r border-[#EAF0EB] flex flex-col z-20 shadow-sm shrink-0 transition-all duration-300">
          <div className="p-6 pb-8 flex items-center justify-between border-b border-[#EAF0EB]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-[#2D3A2F]">Career</span>
                <span className="text-[#52795C]">Compass</span>
              </h1>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              title="Collapse to Dock mode"
              className="p-2 rounded-xl text-[#5C665D] hover:text-[#2D3A2F] hover:bg-[#F5F3EC] transition-all cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
                    active
                      ? 'bg-[#2D3A2F] text-white shadow-md shadow-[#2D3A2F]/20 font-bold scale-[1.02]'
                      : 'text-[#5C665D] hover:bg-[#F5F3EC] hover:text-[#2D3A2F] hover:scale-[1.01]'
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#EAF0EB]">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#5C665D] hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium text-sm"
            >
              <LogOut size={19} />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content Area with ScrollProgress */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ScrollProgress containerRef={containerRef} className="absolute top-0 left-0 right-0" />
        <main ref={containerRef} className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 transition-all">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating Apple-Style Dock: Only shown when mounted and sidebar is collapsed */}
      {mounted && !isSidebarOpen && <AppleStyleDock />}
    </div>
  );
}