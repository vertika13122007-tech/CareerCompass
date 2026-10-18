"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as = "p",
  className = "",
  duration = 1.5,
}: TextShimmerProps) {
  const MotionComponent = motion(as);

  return (
    <MotionComponent
      className={`inline-block relative bg-clip-text text-transparent bg-[length:250%_100%] select-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.95) 50%, currentColor 100%)`,
      }}
      animate={{
        backgroundPosition: ["100% 0", "-100% 0"],
      }}
      transition={{
        repeat: Infinity,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  );
}
