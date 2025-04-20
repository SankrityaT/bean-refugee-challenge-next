'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useGameContext } from '@/context/GameContext';
import ReflectionPrompt from '@/components/ui/ReflectionPrompt';
import { generateReflection } from '@/lib/reflection-engine';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '@/components/ui/ReportDocument';
import PolicyFeedback from '@/components/ui/PolicyFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generatePolicyFeedback } from '@/lib/feedback-generator';
import { CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen, ThumbsUp, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import emailjs from '@emailjs/browser';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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

interface PolicyFeedbackSection {
  type: 'strengths' | 'concerns' | 'recommendation';
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

export default function EthicalReflectionPage() {
  const router = useRouter();
  const { 
    getSelectedPolicyObjects,
    reflectionData,
    setReflectionData,
    saveReflection,
    aiFeedback,
    setAiFeedback,
    selectedPolicies
  } = useGameContext();

  // All hooks at the top!
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, string>>({});
  const [isGeneratingQuestionFeedback, setIsGeneratingQuestionFeedback] = useState<Record<string, boolean>>({});
  
  // Add state for current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Add state for active policy section
  const [activePolicySection, setActivePolicySection] = useState<number>(0);

  // Add state for parsed policy sections
  const [parsedPolicySections, setParsedPolicySections] = useState<PolicyFeedbackSection[]>([]);

  // Add state for tutorial popup
  const [showTutorial, setShowTutorial] = useState(true);

  // Add loading state for final summary
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // First useEffect - for generating reflection data
  useEffect(() => {
    const selectedPolicyObjects = getSelectedPolicyObjects();
    const reflection = generateReflection(selectedPolicyObjects);
    setReflectionData(reflection);
  }, [selectedPolicies]);

  // Second useEffect - for generating feedback
  // MOVE THIS BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // Only run if reflectionData exists
    if (!reflectionData) return;
    
    if (!aiFeedback) {
      generateFeedback();
    } else {
      setPolicyFeedback(aiFeedback);
    }
  }, [reflectionData, aiFeedback]);

  // Handle saving a reflection response
  const handleSaveReflection = (questionId: string, response: string) => {
    saveReflection(questionId, response);
    
    // Generate AI feedback for this specific reflection response
    generateQuestionFeedback(questionId, response);
    
    toast({
      title: "Reflection Saved",
      description: "Your reflection has been saved and will be included in your policy report.",
    });
  };

  // Generate feedback for a specific reflection question response
  const generateQuestionFeedback = async (questionId: string, response: string) => {
    if (!response.trim()) return; // Don't generate feedback for empty responses
    
    setIsGeneratingQuestionFeedback(prev => ({ ...prev, [questionId]: true }));
    console.log(`Generating feedback for question ${questionId} with response: ${response.substring(0, 50)}...`);
    
    try {
      // Find the question text
      const question = reflectionData?.questions.find(q => q.id === questionId);
      if (!question) return;
      
      // Call your AI service to generate feedback
      const feedbackResponse = await fetch('/api/generate-reflection-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.question, // Use question.question instead of question.text
          userResponse: response,
          selectedPolicies: getSelectedPolicyObjects(),
        })
      });
      
      if (!feedbackResponse.ok) {
        console.error(`API responded with status: ${feedbackResponse.status}`);
        // Generate fallback feedback for when API fails
        const fallbackFeedback = generateFallbackFeedback(question.question, response);
        setQuestionFeedback(prev => ({ ...prev, [questionId]: fallbackFeedback }));
        return;
      }
      
      const data = await feedbackResponse.json();
      console.log('Feedback API response:', data);
      
      if (data.feedback) {
        // Store the feedback
        setQuestionFeedback(prev => ({ ...prev, [questionId]: data.feedback }));
        console.log(`Feedback stored for question ${questionId}:`, data.feedback);
      } else {
        // If no feedback is returned, use fallback
        const fallbackFeedback = generateFallbackFeedback(question.question, response);
        setQuestionFeedback(prev => ({ ...prev, [questionId]: fallbackFeedback }));
      }
    } catch (error) {
      console.error('Error generating question feedback:', error);
      // Generate fallback feedback for when API fails
      const question = reflectionData?.questions.find(q => q.id === questionId);
      if (question) {
        const fallbackFeedback = generateFallbackFeedback(question.question, response);
        setQuestionFeedback(prev => ({ ...prev, [questionId]: fallbackFeedback }));
      }
      
      toast({
        title: "Feedback Notice",
        description: "Using local feedback generation since the API is unavailable.",
        variant: "default"
      });
    } finally {
      setIsGeneratingQuestionFeedback(prev => ({ ...prev, [questionId]: false }));
    }
  };
  
  // Generate fallback feedback when API is unavailable
  const generateFallbackFeedback = (questionText: string, response: string): string => {
    console.log('Generating fallback feedback for response:', response);
    
    // Check for nonsensical input (gibberish, random characters, repeated words)
    const text = response.trim().toLowerCase();
    const words = text.split(/\s+/);
    console.log('Words in response:', words);
    
    // Direct check for gibberish words - this should catch inputs like "sfgadsga hello hello"
    // Check if any word looks like gibberish (not in common words and has unusual patterns)
    const gibberishPattern = /[bcdfghjklmnpqrstvwxz]{4,}|[aeiou]{4,}|[a-z]{7,}/i;
    for (const word of words) {
      // Skip very short words
      if (word.length < 4) continue;
      
      // Check if the word matches gibberish patterns and isn't a common word
      if (gibberishPattern.test(word) && !commonEnglishWords.includes(word.toLowerCase())) {
        console.log('Detected gibberish word:', word);
        return "I'm sorry, I couldn't understand what you said. Could you please try again?";
      }
    }
    
    // Check for repeated words
    const wordCounts = words.reduce((acc: Record<string, number>, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    console.log('Word counts:', wordCounts);
    
    // If any word is repeated more than 3 times and makes up more than 40% of the content
    for (const word of Object.keys(wordCounts)) {
      if (wordCounts[word] > 3 && wordCounts[word] >= words.length * 0.4) {
        console.log(`Detected repeated word: ${word} appears ${wordCounts[word]} times out of ${words.length} words`);
        return "I'm sorry, I couldn't understand what you said. Could you please try again?";
      }
    }
    
    // Check for random characters or gibberish
    const gibberishRegex = /[a-z]{7,}|[a-z]{1,2}[a-z]{5,}/;
    
    const gibberishWords = words.filter(word => gibberishRegex.test(word) && !commonEnglishWords.includes(word));
    console.log('Gibberish words detected:', gibberishWords);
    if (gibberishWords.length > 0) {
      console.log(`Detected gibberish: ${gibberishWords.length} gibberish words out of ${words.length} total words`);
      return "I'm sorry, I couldn't understand what you said. Could you please try again?";
    }
    
    // Check for nonsensical or random character strings
    const nonsenseRegex = /^[a-z]{1,2}[a-z\s]{10,}$/;
    console.log('Nonsense regex test result:', nonsenseRegex.test(text));
    console.log('Space test result:', !/\s/.test(text.substring(0, 15)));
    if (nonsenseRegex.test(text) && !/\s/.test(text.substring(0, 15))) {
      console.log('Detected random characters');
      return "I'm sorry, I couldn't understand what you said. Could you please try again?";
    }
    
    // Simple length-based quality check
    if (response.length < 20 || words.length < 5) {
      console.log('Response is too brief:', { length: response.length, wordCount: words.length });
      return "Your response is quite brief. Consider expanding on your thoughts and connecting them to the ethical implications of your policy choices.";
    }
    
    // For quality responses, provide general positive feedback
    console.log('Response passed all quality checks, providing positive feedback');
    return "Thank you for your thoughtful reflection. Your insights show consideration of the ethical dimensions at play. Consider how your policy choices might impact different stakeholders in both the short and long term, and how principles of equity and justice are reflected in your approach.";
  };
  
  // List of common English words to avoid flagging them as gibberish
  const commonEnglishWords = [
    'about', 'after', 'again', 'all', 'also', 'always', 'and', 'any', 'are', 'because',
    'been', 'before', 'being', 'between', 'both', 'but', 'came', 'can', 'come', 'could',
    'did', 'does', 'doing', 'done', 'during', 'each', 'even', 'every', 'from', 'get',
    'getting', 'give', 'goes', 'going', 'had', 'has', 'have', 'having', 'her', 'here',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'however', 'into', 'its', 'itself',
    'just', 'like', 'made', 'make', 'making', 'many', 'might', 'more', 'most', 'much',
    'must', 'myself', 'never', 'now', 'often', 'only', 'other', 'others', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'said', 'same', 'see', 'seeing', 'seen', 'she',
    'should', 'since', 'some', 'still', 'such', 'take', 'taken', 'taking', 'than', 'that',
    'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'thus', 'together', 'too', 'under', 'until', 'upon', 'used',
    'using', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
    'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'would', 'your', 'yours',
    'yourself', 'yourselves', 'hello', 'world', 'policy', 'policies', 'education', 'school',
    'schools', 'student', 'students', 'teacher', 'teachers', 'class', 'classes', 'learn',
    'learning', 'teach', 'teaching', 'equity', 'equitable', 'fair', 'fairness', 'justice',
    'ethical', 'ethics', 'moral', 'morals', 'decision', 'decisions', 'choose', 'choice',
    'choices', 'impact', 'impacts', 'affect', 'affects', 'outcome', 'outcomes', 'result',
    'results', 'consequence', 'consequences', 'stakeholder', 'stakeholders', 'community',
    'communities', 'society', 'social', 'economic', 'political', 'cultural', 'diverse',
    'diversity', 'inclusion', 'inclusive', 'marginalize', 'marginalized', 'underserved',
    'disadvantaged', 'advantage', 'advantaged', 'privilege', 'privileged', 'resource',
    'resources', 'allocate', 'allocation', 'distribute', 'distribution', 'access',
    'accessible', 'opportunity', 'opportunities', 'challenge', 'challenges', 'barrier',
    'barriers', 'solution', 'solutions', 'strategy', 'strategies', 'approach', 'approaches',
    'implement', 'implementation', 'effect', 'effective', 'success', 'successful', 'fail',
    'failure', 'improve', 'improvement', 'enhance', 'enhancement', 'reform', 'change',
    'modify', 'modification', 'adjust', 'adjustment', 'adapt', 'adaptation', 'innovate',
    'innovation', 'create', 'creative', 'think', 'thinking', 'consider', 'consideration',
    'reflect', 'reflection', 'analyze', 'analysis', 'evaluate', 'evaluation', 'assess',
    'assessment', 'measure', 'measurement', 'standard', 'standardize', 'quality', 'value',
    'values', 'belief', 'beliefs', 'principle', 'principles', 'guideline', 'guidelines',
    'rule', 'rules', 'regulation', 'regulations', 'law', 'laws', 'legal', 'illegal',
    'right', 'rights', 'responsibility', 'responsibilities', 'duty', 'duties', 'obligation',
    'obligations', 'commitment', 'commitments', 'promise', 'promises', 'pledge', 'pledges'
  ];
  
  // Generate policy feedback
  const generateFeedback = async () => {
    if (!reflectionData) return;
    
    setIsLoadingFeedback(true);
    
    try {
      const selectedPolicies = getSelectedPolicyObjects();
      const feedback = await generatePolicyFeedback(selectedPolicies, reflectionData);
      
      setPolicyFeedback(feedback);
      
      // Parse the feedback into sections
      const sections = parsePolicyFeedback(feedback);
      setParsedPolicySections(sections);
      setActivePolicySection(0); // Reset to first section
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast({
        title: "Error",
        description: "Could not generate policy feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  };
  
  // Parse policy feedback into sections
  const parsePolicyFeedback = (feedback: string): PolicyFeedbackSection[] => {
    const sections: PolicyFeedbackSection[] = [];
    
    // Ensure we only create exactly 3 sections
    
    // Extract strengths section (always create this one first)
    sections.push({
      type: 'strengths',
      title: 'STRENGTHS',
      content: (feedback.includes('STRENGTHS:') ? 
        feedback.match(/STRENGTHS?:([\s\S]*?)(?=CONCERNS?:|RECOMMENDATIONS?:|$)/i)?.[1]?.trim() || 'No strengths identified.' :
        (feedback.split('\n\n')?.[0] || 'No strengths identified.')).replace(/^[•\*]\s+/gm, ''),
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
      color: 'text-emerald-500'
    });
    
    // Extract concerns section (always second)
    sections.push({
      type: 'concerns',
      title: 'CONCERNS',
      content: (feedback.includes('CONCERNS:') ? 
        feedback.match(/CONCERNS?:([\s\S]*?)(?=RECOMMENDATIONS?:|$)/i)?.[1]?.trim() || 'No concerns identified.' :
        (feedback.split('\n\n')?.[1] || 'No concerns identified.')).replace(/^[•\*]\s+/gm, ''),
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      color: 'text-amber-500'
    });
    
    // Extract recommendations section (always third)
    sections.push({
      type: 'recommendation',
      title: 'RECOMMENDATIONS',
      content: (feedback.includes('RECOMMENDATIONS:') ? 
        feedback.match(/RECOMMENDATIONS?:([\s\S]*?)$/i)?.[1]?.trim() || 'No recommendations available.' :
        (feedback.split('\n\n').slice(2).join('\n\n') || 'No recommendations available.')).replace(/^[•\*]\s+/gm, ''),
      icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
      color: 'text-blue-500'
    });
    
    // Always return exactly 3 sections
    return sections;
  };
  
  // Add functions to navigate between questions
  const handleNextQuestion = () => {
    if (reflectionData && currentQuestionIndex < reflectionData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    if (!reflectionData) return false;
    const currentQuestion = reflectionData.questions[currentQuestionIndex];
    return !!reflectionData.responses[currentQuestion.id];
  };

  useEffect(() => {
    if (!policyFeedback) return;
    
    const sections: PolicyFeedbackSection[] = [];
    
    // Split policy feedback into sections
    const feedbackParts = policyFeedback.split('\n\n');
    
    // Parse each section
    feedbackParts.forEach((part, index) => {
      const lines = part.split('\n');
      
      // Get the title and content
      const title = lines[0];
      const content = lines.slice(1).join('\n');
      
      // Determine the type of section
      let type: PolicyFeedbackSection['type'];
      let icon: React.ReactNode;
      let color: string;
      
      if (index === 0) {
        type = 'strengths';
        icon = <CheckCircle />;
        color = 'bg-hope-turquoise';
      } else if (index === 1) {
        type = 'concerns';
        icon = <AlertTriangle />;
        color = 'bg-policy-maroon';
      } else {
        type = 'recommendation';
        icon = <Lightbulb />;
        color = 'bg-amber-600';
      }
      
      // Add the section to the list
      sections.push({ type, title, content, icon, color });
    });
    
    setParsedPolicySections(sections);
  }, [policyFeedback]);

  // Function to handle proceeding to the summary page
  const handleViewSummary = async () => {
    setIsLoadingSummary(true);
    try {
      // Ensure the last question's answer is saved before counting
      if (
        reflectionData &&
        currentQuestionIndex === reflectionData.questions.length - 1
      ) {
        const lastQuestion = reflectionData.questions[currentQuestionIndex];
        const lastResponse = reflectionData.responses[lastQuestion.id];
        // Try to get the latest input value for the last question
        const lastInput = document.querySelector(
          `textarea[name="reflection-${lastQuestion.id}"]`
        ) as HTMLTextAreaElement | null;
        if (lastInput && lastInput.value !== lastResponse) {
          await handleSaveReflection(lastQuestion.id, lastInput.value);
        }
      }
      // Now count answered questions
      const answeredCount = Object.keys(reflectionData?.responses || {}).length;
      if (answeredCount < 3) {
        toast({
          title: "Please answer at least 3 questions before continuing.",
          description: `You have answered ${answeredCount} so far.`,
          duration: 5000,
          variant: "destructive"
        });
        return;
      }
      // Silently send the PDF to the professor's email before navigating
      try {
        console.log('🔄 Starting PDF email process from ethical reflection page');
        // Get selected policies
        const selectedPolicyObjects = getSelectedPolicyObjects();
        console.log(`📋 Retrieved ${selectedPolicyObjects.length} selected policies`);
        
        console.log('📤 Sending request to PDF email API...');
        // Send the PDF via our API route
        const response = await fetch('/api/send-pdf-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reflectionData,
            selectedPolicies: selectedPolicyObjects,
          }),
        });
        
        // Check if email was sent successfully
        const result = await response.json();
        if (result.success) {
          console.log('✅ PDF generated successfully', result);
        } else {
          console.error('❌ Failed to generate PDF:', result.error);
        }
      } catch (error) {
        console.error('❌ Error in PDF email process:', error);
      }
      
      console.log('🔄 Navigating to summary page...');
      // Navigate to summary page
      router.push('/summary');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (!reflectionData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-policy-maroon"></div>
      </div>
    );
  }

  const currentQuestion = reflectionData.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      
      {/* 🔺 Rainbow Top Bar */}
      <RainbowStripe />
      
      <div className="container mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col relative z-10">
        <div className="max-w-6xl w-full mx-auto">
          {/* White rounded rectangle background for title and subtitle */}
          <div className="bg-white rounded-full py-6 px-8 mb-10 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h1 className="text-center mb-2">
              <span className="text-[#6E1E1E] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">C</span>
              <span className="text-[#FFD700] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">H</span>
              <span className="text-[#1C140D] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">A</span>
              <span className="text-[#388E3C] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">L</span>
              <span className="text-[#42A5F5] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">L</span>
              <span className="text-[#EF6C00] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">E</span>
              <span className="text-[#A0522D] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">N</span>
              <span className="text-[#80C9D5] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">G</span>
              <span className="text-[#E148A1] font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">E</span>
            </h1>
            <p className="text-center text-gray-800 text-lg sm:text-xl font-bold">
              Reflect on the implications of your policy decisions and their impact on refugee education.
            </p>
          </div>
          
          <h2 className="font-bebas text-4xl mb-8 text-[#6E1E1E] tracking-wide text-center md:text-left transition-all duration-300 transform hover:translate-x-1">
            Reflection
          </h2>
          
          {/* Onboarding Tutorial for Ethical Reflection */}
          {showTutorial && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                {/* Rainbow top border */}
                <div className="flex w-full h-3"> 
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
                
                {/* Header with golden background */}
                <div className="bg-[#eac95d] px-8 py-6">
                  <h2 className="font-serif text-3xl text-gray-800 font-bold">Reflection</h2>
                  <p className="text-gray-700 mt-2 font-medium">Considering the impact of your policy decisions</p>
                </div>
                
                <div className="p-8">
                  {/* Step 1 */}
                  <div className="mb-6 bg-gradient-to-r from-[#f0f9ff] to-white p-5 rounded-xl border-l-4 border-[#42A5F5] shadow-sm">
                    <div className="flex gap-5 items-start">
                      <div className="bg-gradient-to-br from-[#42A5F5] to-[#0078D7] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-gray-800 font-semibold">Answer Questions</h3>
                        <p className="text-gray-600 mt-2">
                          Respond to a series of thoughtful questions that will help you consider the ethical implications of your policy choices. You can type or use voice recording to capture your thoughts.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="mb-6 bg-gradient-to-r from-[#fffbeb] to-white p-5 rounded-xl border-l-4 border-[#FFD700] shadow-sm">
                    <div className="flex gap-5 items-start">
                      <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA000] text-gray-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-gray-800 font-semibold">Review Policy Analysis</h3>
                        <p className="text-gray-600 mt-2">
                          Examine the AI-generated analysis of your policy package. The system evaluates your choices in terms of equity, inclusion, and alignment with justice principles for refugee education.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="mb-8 bg-gradient-to-r from-[#f0fdf4] to-white p-5 rounded-xl border-l-4 border-[#388E3C] shadow-sm">
                    <div className="flex gap-5 items-start">
                      <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl text-gray-800 font-semibold">Complete Your Reflection</h3>
                        <p className="text-gray-600 mt-2">
                          Navigate through all reflection questions, considering strengths, concerns, and recommendations from the AI feedback. Your responses will be included in the final policy report.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setShowTutorial(false)}
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium tracking-wide text-white transition-all duration-300 ease-out bg-gradient-to-r from-[#6E1E1E] to-[#A0522D] rounded-full hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2"
                    >
                      <span className="relative flex items-center gap-3">
                        Begin Reflection
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Reflection Questions */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {/* Progress Card */}
              <Card className="bg-white transition-all duration-300 hover:shadow-md mb-6 border border-gray-100 overflow-hidden">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Progress</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden relative">
                      {/* Tracker for how far the user has advanced (current question) */}
                      <div
                        className="bg-green-500 h-5 rounded-full transition-all duration-500 ease-in-out absolute left-0 top-0"
                        style={{ width: `${(Math.min(Object.keys(reflectionData.responses || {}).length, currentQuestionIndex + 1) / reflectionData.questions.length) * 100}%`, zIndex: 1 }}
                      ></div>
                      {/* Tracker for how many questions have been answered */}
                      <div
                        className="bg-blue-400 h-5 rounded-full transition-all duration-500 ease-in-out absolute left-0 top-0"
                        style={{ width: `${((currentQuestionIndex + 1) / reflectionData.questions.length) * 100}%`, opacity: 0.7, zIndex: 2 }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-800 min-w-[35px] text-right">
                      {currentQuestionIndex + 1}/{reflectionData.questions.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Questions Card */}
              <Card className="bg-white transition-all duration-300 hover:shadow-md border border-gray-100 overflow-hidden flex-grow">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-2xl font-bebas text-gray-800">Questions</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col">
                  {/* Only show the current question */}
                  {currentQuestion && (
                    <ReflectionPrompt 
                      key={currentQuestion.id}
                      question={currentQuestion}
                      initialResponse={reflectionData.responses[currentQuestion.id] || ''}
                      onSave={(response) => handleSaveReflection(currentQuestion.id, response)}
                      selectedPolicies={getSelectedPolicyObjects()}
                      feedback={questionFeedback[currentQuestion.id]}
                      isGeneratingFeedback={isGeneratingQuestionFeedback[currentQuestion.id]}
                    />
                  )}
                  
                  {/* Navigation buttons - Previous and Next */}
                  <div className="flex justify-between mt-auto">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="bg-policy-maroon text-white hover:bg-opacity-90 shadow-md"
                    >
                      ← Previous Question
                    </Button>
                    
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === reflectionData.questions.length - 1}
                      className="bg-policy-maroon text-white hover:bg-opacity-90 shadow-md"
                    >
                      Next Question →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Summary and Analysis */}
            <div className="lg:col-span-1 flex flex-col h-full">
              {/* Policy Impact Assessment Card - match height with reflection questions */}
              <Card className="bg-white transition-all duration-300 hover:shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <CardTitle className="text-2xl font-bebas text-gray-800">Policy Impact Analysis</CardTitle>
                  <CardDescription>
                    Your policy package has been analyzed for equity and inclusion
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col flex-grow">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-1">
                      Equity Score
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label="Equity Score Info" className="ml-1 text-gray-500 hover:text-blue-600 focus:outline-none">
                              {/* Visible "i" icon with filled background for contrast */}
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="text-blue-600 font-bold">
                                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="white" />
                                  <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">i</text>
                                </svg>
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-gray-900 p-3">
                            <div className="font-semibold mb-1">Equity Score Rubric</div>
                            <ul className="mb-2 text-sm">
                              <li><span className="font-bold text-green-600">4.0–5.0:</span> Strong equity & inclusion</li>
                              <li><span className="font-bold text-yellow-500">2.5–3.9:</span> Moderate alignment</li>
                              <li><span className="font-bold text-red-500">0–2.4:</span> Limited equity impact</li>
                            </ul>
                            <div className="text-xs text-gray-700">
                              Based on UNESCO metrics. Your current score: <span className="font-bold">{reflectionData.equityScore}/5</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden relative">
                        {/* Colored bar based on equity score */}
                        <div
                          className={`h-5 rounded-full transition-all duration-500 ease-in-out absolute left-0 top-0 ${
                            reflectionData.equityScore >= 4 ? 'bg-green-500' :
                            reflectionData.equityScore >= 2.5 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${(reflectionData.equityScore / 5) * 100}%`, zIndex: 2 }}
                        ></div>
                        {/* Gray background bar for contrast */}
                        <div className="absolute left-0 top-0 w-full h-5 bg-gray-200 rounded-full" style={{ zIndex: 1 }}></div>
                      </div>
                      <span className="font-bold text-gray-800 min-w-[35px] text-right">{reflectionData.equityScore}/5</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Based on UNESCO inclusion metrics for refugee education
                    </p>
                  </div>
                  
                  {/* Policy Analysis Section */}
                  <div className="mt-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-gray-800">Policy Analysis</h3>
                    </div>
                    
                    {isLoadingFeedback ? (
                      <div className="flex justify-center items-center flex-grow">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-policy-maroon"></div>
                      </div>
                    ) : policyFeedback ? (
                      <div className="flex flex-col flex-grow">
                        {/* Show only the active section */}
                        {parsedPolicySections.length > 0 && (
                          <div className="bg-white p-4 rounded-md border-l-4 border-hope-turquoise transition-all duration-300 flex-grow flex flex-col">
                            {/* Centered section content */}
                            <div className="flex flex-col items-center justify-center flex-grow text-center">
                              <div className="mb-3">
                                {parsedPolicySections[activePolicySection]?.type === 'strengths' && <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />}
                                {parsedPolicySections[activePolicySection]?.type === 'concerns' && <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />}
                                {parsedPolicySections[activePolicySection]?.type === 'recommendation' && <Lightbulb className="h-8 w-8 text-blue-600 mx-auto" />}
                              </div>
                              
                              <h4 className="text-xl font-bold text-gray-800 mb-3">
                                {parsedPolicySections[activePolicySection]?.title}
                              </h4>
                              
                              <p className="text-sm text-gray-700 max-w-lg whitespace-pre-line">
                                {parsedPolicySections[activePolicySection]?.content.replace(/^\s*[•\*\-]\s+/gm, '').replace(/CONCERNS:\s*/, '').replace(/STRENGTHS:\s*/, '').replace(/RECOMMENDATIONS?:\s*/, '')}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Dot navigation - ensure exactly 3 dots */}
                        <div className="flex justify-center mt-auto mb-2">
                          {/* Show exactly 3 dots */}
                          <button
                            className={`w-3 h-3 mx-2 rounded-full transition-all duration-300 focus:outline-none ${activePolicySection === 0 ? 'bg-hope-turquoise' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setActivePolicySection(0)}
                            aria-label="View strengths section"
                          />
                          <button
                            className={`w-3 h-3 mx-2 rounded-full transition-all duration-300 focus:outline-none ${activePolicySection === 1 ? 'bg-hope-turquoise' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setActivePolicySection(1)}
                            aria-label="View concerns section"
                          />
                          <button
                            className={`w-3 h-3 mx-2 rounded-full transition-all duration-300 focus:outline-none ${activePolicySection === 2 ? 'bg-hope-turquoise' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setActivePolicySection(2)}
                            aria-label="View recommendations section"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-grow py-8 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-4 text-center px-4">
                          Generate an analysis of your policy choices to understand their potential impact.
                        </p>
                        <Button 
                          onClick={generateFeedback} 
                          className="bg-policy-maroon text-white hover:bg-opacity-90 shadow-md font-medium transition-all duration-300"
                        >
                          Generate Policy Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Navigation Buttons */}
            <div className="lg:col-span-3 flex justify-between mt-12">
              <Button 
                variant="outline" 
                onClick={() => router.push('/stakeholder-negotiation')}
                className="bg-policy-maroon text-white hover:bg-opacity-90 shadow-md font-medium py-2 px-6 rounded-md transition-all duration-300 hover:translate-x-[-2px]"
              >
                ← Back to Negotiation
              </Button>
              
              <Button 
                className="bg-policy-maroon text-white hover:bg-opacity-90 shadow-md font-medium py-2 px-6 rounded-md transition-all duration-300 hover:translate-x-[2px]"
                onClick={handleViewSummary}
                disabled={isLoadingSummary}
              >
                {isLoadingSummary ? (
                  <>
                    <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full align-middle"></span>
                    Submitting...
                  </>
                ) : (
                  <>View Final Summary →</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 🔻 Rainbow Bottom Bar */}
      <RainbowStripe />
    </div>
  );
}