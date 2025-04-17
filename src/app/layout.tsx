'use client';

import { GameProvider } from '@/context/GameContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './globals.css';
import '../styles/scrollbar.css';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GameProvider>
              {children}
            </GameProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}