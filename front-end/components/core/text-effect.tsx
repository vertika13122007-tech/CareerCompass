"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export interface TextEffectProps {
  children: string;
  className?: string;
  preset?: "fade-in-blur" | "fade" | "slide";
  speedReveal?: number;
  speedSegment?: number;
  as?: React.ElementType;
  delay?: number;
  per?: "word" | "char";
}

export function TextEffect({
  children,
  className = "",
  preset = "fade-in-blur",
  speedReveal = 1,
  speedSegment = 0.25,
  as = "h1",
  delay = 0,
  per = "word",
}: TextEffectProps) {
  if (typeof children !== "string") {
    return <span className={className}>{children}</span>;
  }

  const items = per === "char" ? children.split("") : children.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speedSegment / speedReveal,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: preset === "slide" ? 16 : 8,
      filter: preset === "fade-in-blur" ? "blur(6px)" : "blur(0px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.45 / speedReveal,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const MotionComponent = motion(as);

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`inline-block ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <motion.span
            variants={itemVariants}
            className="inline-block whitespace-pre"
          >
            {item}
          </motion.span>
          {per === "word" && index < items.length - 1 && " "}
        </React.Fragment>
      ))}
    </MotionComponent>
  );
}
