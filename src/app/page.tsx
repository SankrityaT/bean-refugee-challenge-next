'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Book, Play, Users, DollarSign, School, BrainCircuit, Lightbulb } from "lucide-react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

// Rainbow stripe component (top + bottom)
const RainbowStripe = () => (
  <div className="flex w-full h-8"> 
    <div className="flex-1 bg-[#6E1E1E]" />
    <div className="flex-1 bg-[#FFD700]" />
    <div className="flex-1 bg-[#1C140D]" />
    <div className="flex-1 bg-[#388E3C]" />
    <div className="flex-1 bg-[#42A5F5]" />
    <div className="flex-1 bg-[#EF6C00]" />
    <div className="flex-1 bg-[#A0522D]" />
    <div className="flex-1 bg-[#80C9D5]" />
    <div className="flex-1 bg-[#E148A1]" />
  </div>
);

// Image component for headers
const ImageHeader = ({ src, alt }: { src: string; alt: string }) => (
  <div className="w-full h-full">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

export default function Home() {
  const router = useRouter();
  
  const handleAcceptChallenge = () => {
    router.push('/policy-selection');
  };
  
  return (
    <div className="min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      
      {/* 🔺 Rainbow Top Bar */}
      <RainbowStripe />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-6xl w-full">
          {/* White rounded rectangle background for title and subtitle */}
          <div className="bg-white rounded-full py-8 px-8 mb-16 shadow-lg">
            <h1 className="text-center mb-2">
              <span className="text-[#6E1E1E] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">C</span>
              <span className="text-[#FFD700] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">H</span>
              <span className="text-[#1C140D] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">A</span>
              <span className="text-[#388E3C] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">L</span>
              <span className="text-[#42A5F5] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">L</span>
              <span className="text-[#EF6C00] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">E</span>
              <span className="text-[#A0522D] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">N</span>
              <span className="text-[#80C9D5] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">G</span>
              <span className="text-[#E148A1] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">E</span>
            </h1>
            <p className="text-center text-gray-800 text-lg sm:text-xl md:text-2xl font-bold">
              Creating Holistic Approaches for Learning, Liberty, and Equity in New Global Education
            </p>
          </div>
          
          {/* Bento grid layout - 3x2 grid with equal sizes */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First row - 3 equal cards */}
              <BentoGridItem
                title="Policy Making"
                description="Make critical policy decisions across 7 key areas affecting refugee education."
                header={<ImageHeader src="/policyMaker.jpg" alt="Policy Making" />}
              />
              <BentoGridItem
                title="Budget Constraints"
                description="Balance resources effectively with a 14 units budget while addressing diverse educational needs."
                header={<ImageHeader src="/budgetConstraintsWomen.jpg" alt="Budget Constraints" />}
              />
              <BentoGridItem
                title="Stakeholder Engagement"
                description="Negotiate with different stakeholders to build consensus for your policy choices."
                header={<ImageHeader src="/stakeholder.jpg" alt="Stakeholder Engagement" />}
              />
              
              {/* Second row - 3 equal cards */}
              <BentoGridItem
                title="Dilemmas"
                description="Confront moral dilemmas and social tensions inherent in refugee education policy."
                header={<ImageHeader src="/dilemmasWomen.jpg" alt="Ethical Dilemmas" />}
              />
              <BentoGridItem
                title="Republic of Bean"
                description="Navigate a fictional but deeply familiar setting shaped by historical exclusion and political instability."
                header={<ImageHeader src="/republicOfBean.jpg" alt="Republic of Bean" />}
              />
              <BentoGridItem
                title="Reflection"
                description="Reflect on your decisions and their implications for equity, justice, and inclusion."
                header={<ImageHeader src="/womenCriticalReflection.jpg" alt="Critical Reflection" />}
              />
            </div>
          </div>

          <div className="relative mb-16 sm:mb-20 md:mb-24">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 blur-3xl opacity-30" />
            
            {/* Fixed marquee title */}
            <div className="overflow-hidden mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                <div className="whitespace-nowrap inline-block animate-marquee">
                  Your Mission — Creating positive change through thoughtful policy decisions — Your Mission
                </div>
              </h2>
            </div>
            
            {/* Mission cards section removed */}
          </div>

          <div className="flex justify-center mt-8 sm:mt-12 md:mt-16 mb-12 sm:mb-16 md:mb-24 px-4">
            <Button
              onClick={handleAcceptChallenge}
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium tracking-wide text-white transition-all duration-500 ease-out bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 w-full sm:w-auto"
              aria-label="Accept the Challenge"
            >
              <span className="relative flex items-center gap-2">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:translate-x-1" />
                <span className="relative">
                  Accept the Challenge
                  <span className="absolute left-0 -bottom-1 w-full h-px bg-white/50 transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* 🔻 Rainbow Bottom Bar */}
      <RainbowStripe />
    </div>
  );
}

// Update the MissionCard component to be more responsive
const MissionCard = ({ 
  title, 
  description, 
  icon, 
  gradient 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  gradient: string;
}) => (
  <div 
    className={`flex-shrink-0 w-72 sm:w-80 md:w-96 p-5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
    role="article"
  >
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-white text-lg">{title}</h3>
    </div>
    <p className="text-white/90 text-sm sm:text-base">{description}</p>
  </div>
);
