
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReflectionPromptProps {
  question: string;
  category: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ question, category }) => {
  const [response, setResponse] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  return (
    <Card className="bg-[#FFFFF0] border-2 border-reflection-yellow my-4 transform transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500 uppercase">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-black font-opensans font-semibold leading-relaxed">
          {question}
        </p>
        
        {isAnswering && (
          <Textarea 
            placeholder="Enter your reflection..." 
            className="mt-4"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        )}
      </CardContent>
      {isAnswering ? (
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAnswering(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => setIsAnswering(false)}
            className="bg-reflection-yellow text-black hover:bg-reflection-yellow/80"
          >
            Save Reflection
          </Button>
        </CardFooter>
      ) : (
        <CardFooter>
          <Button 
            onClick={() => setIsAnswering(true)}
            variant="outline" 
            className="w-full border-reflection-yellow text-black hover:bg-reflection-yellow/10"
          >
            Reflect on this question
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReflectionPrompt;
