import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

type FloatingTagProps = PropsWithChildren<{
  className?: string;
  initial?: { x?: number; y?: number };
  label: string;
}>;

export const FloatingTag = ({ className, initial, label }: FloatingTagProps) => {
  const prefersReducedMotion = useReducedMotion();
  // Framer Motion typing workaround for React 19 strict TS builds
  const MDiv = motion.div as any;
  const drift = prefersReducedMotion
    ? {}
    : {
        animate: {
          x: [0, 8, -6, 0],
          y: [0, -6, 8, 0]
        },
        transition: {
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror" as const,
          ease: "easeInOut"
        }
      };

  return (
    <MDiv
      aria-label={label}
      initial={{ opacity: 0, scale: 0.98, ...initial }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      {...drift}
      className={clsx(
        "rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-md backdrop-blur-md",
        "dark:border-white/20 dark:bg-white/10 dark:text-white",
        className
      )}
    >
      {label}
    </MDiv>
  );
};
