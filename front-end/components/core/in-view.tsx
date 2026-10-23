"use client";

import React from "react";
import {
  motion,
  UseInViewOptions,
  Variants,
  Transition,
} from "framer-motion";

export interface InViewProps {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: string | React.ElementType;
  className?: string;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const defaultTransition: Transition = {
  duration: 0.45,
  ease: [0.25, 0.1, 0.25, 1],
};

export function InView({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  viewOptions = { once: true, margin: "0px 0px -60px 0px" },
  as = "div",
  className = "",
}: InViewProps) {
  const Component = typeof as === "string" && as in motion ? (motion as any)[as] : motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewOptions}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </Component>
  );
}

