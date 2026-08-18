'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Map, MessageSquare, Sparkles, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', href: '/dashboard/upload', icon: Upload },
    { name: 'Learning Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'AI Coach', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Optimizer', href: '/dashboard/optimizer', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] text-[#2D3A2F] font-sans overflow-hidden">
      <aside className="w-72 bg-white shadow-[4px_0_24px_rgba(214,211,204,0.3)] flex flex-col z-10">
        <div className="p-8 pb-10">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#2D3A2F]">Career</span>
            <span className="text-[#52795C]">Compass</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
                  active ? 'bg-[#EAF0EB] text-[#3B5942]' : 'text-[#5C665D] hover:bg-[#F5F3EC] hover:text-[#2D3A2F]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#F5F3EC]">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#8C938D] hover:bg-[#FCEAE8] hover:text-[#B74134] transition-colors font-medium">
            <LogOut size={20} />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}