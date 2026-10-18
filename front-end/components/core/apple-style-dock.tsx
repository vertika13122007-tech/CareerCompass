"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Upload,
  Map,
  MessageSquare,
  Sparkles,
  Wand2,
  FileText,
} from "lucide-react";

interface DockItemData {
  title: string;
  icon: React.ElementType;
  href: string;
}

const DOCK_ITEMS: DockItemData[] = [
  { title: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Pipeline", icon: Briefcase, href: "/dashboard/jobs" },
  { title: "Upload", icon: Upload, href: "/dashboard/upload" },
  { title: "Roadmap", icon: Map, href: "/dashboard/roadmap" },
  { title: "AI Coach", icon: MessageSquare, href: "/dashboard/chat" },
  { title: "Optimizer", icon: Sparkles, href: "/dashboard/optimizer" },
  { title: "Tailor", icon: Wand2, href: "/dashboard/tailor" },
  { title: "Cover Letter", icon: FileText, href: "/dashboard/cover-letter" },
];

function DockIcon({
  mouseX,
  item,
}: {
  mouseX: any;
  item: DockItemData;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const isActive = pathname === item.href;

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-140, 0, 140], [42, 64, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const Icon = item.icon;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-semibold whitespace-nowrap shadow-md backdrop-blur-sm pointer-events-none z-50"
          >
            {item.title}
          </motion.div>
        )}
      </AnimatePresence>

      <Link href={item.href} className="outline-none">
        <motion.div
          style={{ width, height: width }}
          whileTap={{ scale: 0.9 }}
          className={`aspect-square rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
            isActive
              ? "bg-[#2D3A2F] text-white border-[#2D3A2F] shadow-md shadow-[#2D3A2F]/25"
              : "bg-white/90 text-[#2D3A2F] hover:text-[#52795C] hover:bg-white border-[#EAF0EB] shadow-xs"
          }`}
        >
          <Icon className="w-1/2 h-1/2" />
        </motion.div>
      </Link>

      {/* Active Dot Indicator */}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#52795C] shadow-[0_0_8px_rgba(82,121,92,0.8)] mt-1 shrink-0" />
      )}
      {!isActive && <span className="w-1.5 h-1.5 mt-1 shrink-0" />}
    </div>
  );
}

export function AppleStyleDock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden md:block">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-end gap-2 px-3.5 py-2.5 rounded-[1.75rem] bg-white/85 backdrop-blur-2xl border border-[#EAF0EB] shadow-[0_16px_40px_rgba(45,58,47,0.08),inset_1px_1px_4px_rgba(255,255,255,0.95)]"
      >
        {DOCK_ITEMS.map((item) => (
          <DockIcon key={item.href} mouseX={mouseX} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
