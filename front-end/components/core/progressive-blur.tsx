'use client';

import React from 'react';

export type ProgressiveBlurProps = {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: string | number;
  blurMax?: number;
  layers?: number;
  className?: string;
};

export function ProgressiveBlur({
  direction,
  side,
  size = '3.5rem',
  blurMax = 12,
  layers = 6,
  className = '',
}: ProgressiveBlurProps) {
  const activeSide = direction || side || 'left';
  const isHorizontal = activeSide === 'left' || activeSide === 'right';

  const positionClasses = {
    top: 'inset-x-0 top-0',
    bottom: 'inset-x-0 bottom-0',
    left: 'inset-y-0 left-0',
    right: 'inset-y-0 right-0',
  }[activeSide];

  const sizeStyle = isHorizontal
    ? { width: typeof size === 'number' ? `${size}px` : size }
    : { height: typeof size === 'number' ? `${size}px` : size };

  const maskDirection =
    activeSide === 'left'
      ? 'to right'
      : activeSide === 'right'
      ? 'to left'
      : activeSide === 'top'
      ? 'to bottom'
      : 'to top';

  return (
    <div
      className={`absolute pointer-events-none z-10 ${positionClasses} ${className}`}
      style={sizeStyle}
    >
      {/* Progressive Blur Layers */}
      {Array.from({ length: layers }).map((_, index) => {
        const blurValue = (blurMax / layers) * (index + 1);
        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blurValue}px)`,
              WebkitBackdropFilter: `blur(${blurValue}px)`,
              maskImage: `linear-gradient(${maskDirection}, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)`,
              WebkitMaskImage: `linear-gradient(${maskDirection}, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}
