'use client';

import { motion, useScroll, useSpring, SpringOptions } from 'framer-motion';
import { RefObject } from 'react';

export type ScrollProgressProps = {
  className?: string;
  containerRef?: RefObject<HTMLElement | null>;
  springOptions?: SpringOptions;
};

export function ScrollProgress({
  className = '',
  containerRef,
  springOptions = {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  },
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : {}
  );

  const scaleX = useSpring(scrollYProgress, springOptions);

  return (
    <motion.div
      className={`origin-left h-1 z-50 bg-[#52795C] ${className || 'fixed top-0 inset-x-0'}`}
      style={{ scaleX }}
    />
  );
}
