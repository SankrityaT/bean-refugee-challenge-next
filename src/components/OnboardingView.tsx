
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Play, Users, DollarSign, School, BrainCircuit, Lightbulb } from "lucide-react";

const OnboardingView = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="min-h-screen bg-policy-maroon text-white flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          <h1 className="font-bebas text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider mb-6 text-center">
            THE CHALLENGE GAME
          </h1>
          
          <p className="text-hope-turquoise text-xl md:text-2xl mb-12 text-center">
            Creating Holistic Approaches for Learning, Liberty, and Equity in New Global Education
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <School className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Policy Making</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Make critical policy decisions across 7 key areas affecting refugee education.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <DollarSign className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Budget Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Balance your budget of $200M while addressing critical needs and priorities.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <Users className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Stakeholder Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Negotiate with different stakeholders to build consensus for your policy choices.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <BrainCircuit className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Ethical Dilemmas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Confront moral dilemmas and social tensions inherent in refugee education policy.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <Book className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Republic of Bean</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Navigate a fictional but deeply familiar setting shaped by historical exclusion and political instability.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/20 border-hope-turquoise text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <Lightbulb className="h-8 w-8 text-hope-turquoise mb-2" />
                <CardTitle>Critical Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Reflect on your decisions and their implications for equity, justice, and inclusion.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm mb-8">
            <h2 className="font-bebas text-2xl mb-3">Your Mission</h2>
            <p className="mb-4">
              As a member of parliament in the Republic of Bean, you must develop a comprehensive refugee education reform package. With two million refugees entering your country, you'll need to make tough decisions across seven policy domains under tight budget constraints.
            </p>
            <p>
              Prepare to confront moral dilemmas, social tensions, and resource scarcity as you navigate competing demands from various stakeholders. Your choices will shape the future of education in the Republic of Bean.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={onComplete} 
              className="bg-hope-turquoise text-black hover:bg-hope-turquoise/80 text-lg px-8 py-6 rounded-md animate-pulse"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Accept the Challenge
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-hope-turquoise/80">
        A simulation for engaging with refugee education policy through critical pedagogy and participatory action research.
      </footer>
    </div>
  );
};

export default OnboardingView;
