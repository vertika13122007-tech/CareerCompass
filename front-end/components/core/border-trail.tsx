"use client";

import { motion, Transition } from "framer-motion";
import React from "react";

export interface BorderTrailProps {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
}

export function BorderTrail({
  className = "",
  size = 60,
  transition,
  delay = 0,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const defaultTransition: Transition = {
    repeat: Infinity,
    duration: 4,
    ease: "linear",
    delay,
    ...transition,
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={`absolute aspect-square bg-emerald-500/80 ${className}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round inherit)`,
          ...style,
        }}
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={defaultTransition}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
