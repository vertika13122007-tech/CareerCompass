"use client";

import { useEffect, useRef } from "react";
import { useSpring, useTransform, motion } from "framer-motion";

export interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  springOptions?: {
    bounce?: number;
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  format?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  className = "",
  springOptions = { bounce: 0, damping: 25, stiffness: 90 },
  format = (val) => Math.round(val).toString(),
}: AnimatedNumberProps) {
  const spring = useSpring(0, springOptions);
  const display = useTransform(spring, (current) => format(current));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value || 0);
  }, [spring, value]);

  return (
    <motion.span ref={spanRef} className={className}>
      {display}
    </motion.span>
  );
}
