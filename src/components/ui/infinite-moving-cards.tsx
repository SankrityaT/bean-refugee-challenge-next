"use client"
import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";

interface Item {
  title: string;
  description: string;
  icon?: React.ReactNode;
  gradient?: string;
}

interface InfiniteMovingCardsProps {
  items: Item[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  className?: string;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  className,
}: InfiniteMovingCardsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      setStart(true);
    }
  }

  const speedValue = {
    fast: "20s",
    normal: "40s",
    slow: "80s",
  };

  // Mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 overflow-hidden scrollable-container",
        isHovering ? "overflow-x-auto" : "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full gap-4 py-4",
          start && !isHovering && direction === "left" ? "animate-scroll" : "",
          start && !isHovering && direction === "right" ? "animate-scroll-reverse" : "",
          isDragging ? "pointer-events-none" : ""
        )}
        style={
          {
            "--animation-duration": speedValue[speed],
          } as React.CSSProperties
        }
      >
        {items.map((item, idx) => (
          <li
            key={item.title + idx}
            className="relative flex-shrink-0 w-[350px] max-w-full rounded-2xl border border-slate-700 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm px-8 py-6 group"
          >
            <div className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
              item.gradient
            )} />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                {item.icon}
                <h3 className={cn(
                  "text-xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                  item.gradient
                )}>
                  {item.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};