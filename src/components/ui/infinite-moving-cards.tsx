"use client"
import { cn } from "@/lib/utils";
import React from "react";

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = React.useState(false);

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full gap-4 py-4",
          start && "animate-scroll",
          direction === "left" ? "animate-scroll" : "animate-scroll-reverse"
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
            className="relative flex-shrink-0 w-[350px] max-w-full rounded-2xl border border-slate-700 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm px-8 py-6"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
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