'use client';

import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className = '',
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const translation = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const measurement = direction === 'horizontal' ? size.width : size.height;
    if (!measurement) return;

    const contentSize = measurement + gap;
    const finalPosition = reverse ? contentSize : -contentSize;

    const controls = animate(translation, [0, finalPosition], {
      ease: 'linear',
      duration: currentDuration,
      repeat: Infinity,
      repeatType: 'loop',
      onRepeat: () => {
        translation.set(0);
      },
    });

    return () => controls.stop();
  }, [translation, size.width, size.height, gap, currentDuration, reverse, direction]);

  const hoverProps = durationOnHover
    ? {
        onMouseEnter: () => setCurrentDuration(durationOnHover),
        onMouseLeave: () => setCurrentDuration(duration),
      }
    : {};

  return (
    <div className={`overflow-hidden relative ${className}`} {...hoverProps}>
      <motion.div
        className={`flex ${direction === 'horizontal' ? 'w-max' : 'flex-col h-max'}`}
        style={{
          [direction === 'horizontal' ? 'x' : 'y']: translation,
          gap: `${gap}px`,
        }}
      >
        <div
          ref={containerRef}
          className={`flex shrink-0 ${direction === 'horizontal' ? 'items-center' : 'flex-col items-center'}`}
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>
        <div
          className={`flex shrink-0 ${direction === 'horizontal' ? 'items-center' : 'flex-col items-center'}`}
          style={{ gap: `${gap}px` }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
