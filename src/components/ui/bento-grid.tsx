"use client"
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  className,
  children,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Clone children and pass the hoveredIndex
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isHovered: hoveredIndex === index,
        onHover: () => setHoveredIndex(index),
        onLeave: () => setHoveredIndex(null),
        index,
        anyHovered: hoveredIndex !== null,
      } as BentoGridItemProps);
    }
    return child;
  });

  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-6 md:auto-rows-[20rem] md:grid-cols-3",
        className,
      )}
    >
      {childrenWithProps}
    </div>
  );
};

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  isHovered?: boolean;
  anyHovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  index?: number;
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  title,
  description,
  header,
  icon,
  isHovered,
  anyHovered,
  onHover,
  onLeave,
  index,
}) => {
  return (
    <motion.div
      className={cn(
        "group/bento relative overflow-hidden rounded-xl aspect-[4/3]",
        isHovered 
          ? "shadow-xl scale-[1.03] z-10" 
          : anyHovered 
            ? "opacity-70" 
            : "hover:shadow-lg",
        className,
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2
      }}
    >
      {/* Image container */}
      <div className="w-full h-full">
        {header}
      </div>
      
      {/* Static text overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
        <div className="font-bold text-white text-lg mb-1">
          {title}
        </div>
        <div className="text-sm text-white/90">
          {description}
        </div>
      </div>
    </motion.div>
  );
};