"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface AnimatedTabsHoverProps {
  tabs: string[];
  activeTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
  tabClassName?: string;
  idPrefix?: string;
}

export function AnimatedTabsHover({
  tabs,
  activeTab: controlledActive,
  onChange,
  className = "",
  tabClassName = "",
  idPrefix = "animated-tab",
}: AnimatedTabsHoverProps) {
  const [internalActive, setInternalActive] = useState(tabs[0] || "");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const currentActive = controlledActive !== undefined ? controlledActive : internalActive;

  const handleSelect = (tab: string) => {
    setInternalActive(tab);
    onChange?.(tab);
  };

  return (
    <div
      onMouseLeave={() => setHoveredTab(null)}
      className={`inline-flex items-center gap-1 p-1.5 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] shadow-xs relative ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab === currentActive;
        const isHovered = tab === hoveredTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleSelect(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            className={`relative px-4 py-2 text-xs font-bold transition-colors duration-200 cursor-pointer rounded-xl select-none z-10 ${
              isActive
                ? "text-[#1E293B]"
                : "text-[#64748B] hover:text-[#1E293B]"
            } ${tabClassName}`}
          >
            {/* Active or Hovered Spring Pill */}
            {isHovered && (
              <motion.span
                layoutId={`${idPrefix}-hover`}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-white/70 rounded-xl shadow-xs -z-10"
              />
            )}
            {isActive && !isHovered && (
              <motion.span
                layoutId={`${idPrefix}-active`}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
