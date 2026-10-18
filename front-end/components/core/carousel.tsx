"use client";

import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselContextType {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = createContext<CarouselContextType | null>(null);

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
}

export function Carousel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 5);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollPrev = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.75, behavior: "smooth" });
  };

  const scrollNext = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <CarouselContext.Provider
      value={{ scrollPrev, scrollNext, canScrollPrev, canScrollNext, containerRef }}
    >
      <div className={`relative w-full ${className}`}>{children}</div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { containerRef } = useCarousel();

  return (
    <div
      ref={containerRef}
      className={`flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-none scroll-smooth pb-2 ${className}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {children}
    </div>
  );
}

export function CarouselItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`shrink-0 snap-start select-none ${className}`}>
      {children}
    </div>
  );
}

export function CarouselNavigation({
  className = "",
}: {
  className?: string;
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  return (
    <div className={`flex items-center justify-end gap-2 mt-3 ${className}`}>
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous slide"
        className="p-2 rounded-full border border-[#E2E8F0] bg-white shadow-xs hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-[#1E293B]"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next slide"
        className="p-2 rounded-full border border-[#E2E8F0] bg-white shadow-xs hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-[#1E293B]"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
