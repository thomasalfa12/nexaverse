"use client";
import { useScroll, useTransform, motion } from "framer-motion"; // Menggunakan import standar dari framer-motion
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  className?: string;
}

export const Timeline = ({
  data,
  className,
}: {
  data: TimelineEntry[];
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      <div ref={ref} className="relative max-w-5xl mx-auto py-10">
        {/* Garis Timeline */}
        <div
          style={{ height: `${height}px` }}
          className="absolute md:left-8 left-4 top-0 w-[2px] bg-gray-200 dark:bg-neutral-800"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary via-blue-500 to-transparent"
          />
        </div>

        {/* Konten Timeline */}
        {data.map((item, index) => (
          <div
            key={`timeline-item-${index}`}
            className="flex justify-start items-start pt-10 md:pt-20 md:gap-10"
          >
            {/* Bagian Kiri (Judul Sticky) */}
            <div className="sticky flex flex-col md:flex-row z-10 items-center top-28 md:top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* FIX: Menggunakan trik translate-x untuk centering yang sempurna */}
              <div className="h-10 w-10 absolute left-4 -translate-x-1/2 md:left-8 md:-translate-x-1/2 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <h3 className="hidden md:block text-2xl md:pl-16 lg:pl-20 md:text-4xl font-bold text-muted-foreground">
                {item.title}
              </h3>
            </div>

            {/* Bagian Kanan (Konten Scroll) */}
            <div
              className={cn(
                "relative pl-14 pr-4 md:pl-4 w-full",
                item.className
              )}
            >
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-foreground">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
