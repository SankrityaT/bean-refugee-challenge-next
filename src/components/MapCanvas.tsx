
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const MapCanvas = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mb-6">
      <svg 
        viewBox="0 0 800 500" 
        className="w-full h-full"
        aria-label="Map of the Republic of Bean showing refugee routes"
      >
        {/* Country borders - Maroon */}
        <path 
          d="M150,100 L650,100 L700,250 L650,400 L150,400 L100,250 Z" 
          fill="none" 
          stroke="#800000" 
          strokeWidth="6"
          className={cn("transition-all duration-1000", animate ? "opacity-100" : "opacity-0")}
        />
        
        {/* Regions */}
        <circle cx="250" cy="200" r="50" fill="#f0f0f0" stroke="#800000" strokeWidth="3" />
        <circle cx="550" cy="200" r="50" fill="#f0f0f0" stroke="#800000" strokeWidth="3" />
        <circle cx="400" cy="300" r="60" fill="#f0f0f0" stroke="#800000" strokeWidth="3" />
        
        {/* Refugee routes - Yellow with pulse effect */}
        <path 
          d="M150,250 C250,230 300,300 400,300" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="4" 
          strokeDasharray="5,5"
          className={cn("animate-pulse-route", animate ? "opacity-100" : "opacity-0")}
        />
        <path 
          d="M650,250 C550,230 500,300 400,300" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="4" 
          strokeDasharray="5,5"
          className={cn("animate-pulse-route", animate ? "opacity-100" : "opacity-0")}
        />
        
        {/* Refugee points */}
        <circle cx="150" cy="250" r="8" fill="#FFD700" className={cn("animate-pulse-route", animate ? "opacity-100" : "opacity-0")} />
        <circle cx="650" cy="250" r="8" fill="#FFD700" className={cn("animate-pulse-route", animate ? "opacity-100" : "opacity-0")} />
        <circle cx="400" cy="300" r="10" fill="#FFD700" className={cn("animate-pulse-route", animate ? "opacity-100" : "opacity-0")} />
        
        {/* City labels */}
        <text x="250" y="200" textAnchor="middle" fill="#000000" fontFamily="Open Sans" fontSize="14">Capital</text>
        <text x="550" y="200" textAnchor="middle" fill="#000000" fontFamily="Open Sans" fontSize="14">Port City</text>
        <text x="400" y="300" textAnchor="middle" fill="#000000" fontFamily="Open Sans" fontSize="14">Refugee Center</text>
      </svg>
    </div>
  );
};

export default MapCanvas;
