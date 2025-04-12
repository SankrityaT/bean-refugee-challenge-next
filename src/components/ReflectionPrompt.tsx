
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReflectionPromptProps {
  question: string;
  category: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ question, category }) => {
  return (
    <Card className="bg-[#FFFFF0] border-2 border-reflection-yellow my-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-500 uppercase">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-black font-opensans font-semibold leading-relaxed">
          {question}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReflectionPrompt;
