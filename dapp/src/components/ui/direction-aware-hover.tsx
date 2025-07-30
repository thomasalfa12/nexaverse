"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DirectionAwareHover = ({
  imageUrl,
  children,
  childrenClassName,
  imageClassName,
  className,
}: {
  imageUrl: string;
  children: React.ReactNode | string;
  childrenClassName?: string;
  imageClassName?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<
    "top" | "bottom" | "left" | "right" | string
  >("left");

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!ref.current) return;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const edgeTolerance = 10;

    if (x < edgeTolerance) setDirection("left");
    else if (x >= width - edgeTolerance) setDirection("right");
    else if (y < edgeTolerance) setDirection("top");
    else if (y >= height - edgeTolerance) setDirection("bottom");
    else {
      // Fallback for mouse entering from the center
      const side =
        Math.abs(width / 2 - x) > Math.abs(height / 2 - y)
          ? x > width / 2
            ? "right"
            : "left"
          : y > height / 2
          ? "bottom"
          : "top";
      setDirection(side);
    }
  };

  const variants = {
    initial: {
      x: direction === "right" ? "100%" : direction === "left" ? "-100%" : 0,
      y: direction === "bottom" ? "100%" : direction === "top" ? "-100%" : 0,
      opacity: 0,
    },
    exit: {
      x: direction === "right" ? "100%" : direction === "left" ? "-100%" : 0,
      y: direction === "bottom" ? "100%" : direction === "top" ? "-100%" : 0,
      opacity: 0,
    },
    animate: { x: 0, y: 0, opacity: 1 },
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      ref={ref}
      className={cn(
        "group/card relative h-full w-full overflow-hidden rounded-lg bg-background",
        className
      )}
    >
      <AnimatePresence>
        <motion.div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt="image"
            className={cn(
              "h-full w-full object-cover scale-[1.02] group-hover/card:scale-100 transition-scale duration-300",
              imageClassName
            )}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/600x400/EEE/31343C?text=Image+Error`;
            }}
          />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 z-10 hidden items-center justify-center bg-black/60 p-2 text-white group-hover/card:flex"
        >
          <div className={cn("h-full w-full", childrenClassName)}>
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
