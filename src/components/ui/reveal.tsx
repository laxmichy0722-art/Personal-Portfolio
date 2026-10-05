"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance animation.
 *
 * Deliberately restrained: a short fade with a small upward offset, fired once
 * when the element first enters the viewport. When the visitor has asked for
 * reduced motion, children render immediately with no transform or transition —
 * the content is identical either way.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  /** Distance travelled, in pixels. Larger feels slower. */
  distance = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. Use small increments (0.05–0.12) to stagger siblings. */
  delay?: number;
  distance?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    return (
      <Component
        className={className}
        initial={false}
        style={{ opacity: 1, transform: "none" }}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Component>
  );
}

/** Container that staggers its `RevealItem` children. */
export function RevealGroup({
  children,
  className,
  /** Seconds between each child's entrance. */
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol" | "dl" | "section";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    return (
      <Component className={className} initial={false}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Component>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/** A single child of `RevealGroup`. Animates only when reduced motion is off. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    return (
      <Component className={className} initial={false}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={cn(className)} variants={itemVariants}>
      {children}
    </Component>
  );
}