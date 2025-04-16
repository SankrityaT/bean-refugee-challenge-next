'use client';

import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";
import OnboardingView from '@/components/ui/OnboardingView';

export default function OnboardingPage() {
  const router = useRouter();
  
  const handleCompleteOnboarding = () => {
    toast({
      title: "Welcome to The CHALLENGE Game",
      description: "You can now start making policy decisions for the Republic of Bean.",
    });
    
    // Navigate to the policy selection page
    router.push('/policy-selection');
  };
  
  return <OnboardingView onComplete={handleCompleteOnboarding} />;
}