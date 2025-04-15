import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FocusCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FocusCards = ({ children, className, ...props }: FocusCardsProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto", className)}
      {...props}
    >
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return null;

        return React.cloneElement(child as React.ReactElement, {
          onMouseEnter: () => setHoveredIndex(idx),
          onMouseLeave: () => setHoveredIndex(null),
          style: {
            opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.6,
            transform: hoveredIndex === idx ? "scale(1.05)" : "scale(1)",
            transition: "all 0.3s ease"
          }
        });
      })}
    </div>
  );
};
