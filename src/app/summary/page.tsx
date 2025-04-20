'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from '@/context/GameContext';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft, Home, Mail, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from '@/components/ui/use-toast';

export default function SummaryPage() {
  const router = useRouter();
  const { 
    getSelectedPolicyObjects,
    reflectionData,
    aiFeedback,
    negotiationLogs
  } = useGameContext();
  
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfFilename, setPdfFilename] = useState('challenge-policy-summary.pdf');
  
  // Helper: Consolidate negotiation summary per agent
  function getNegotiationSummary(logs) {
    if (!logs || logs.length === 0) return [];
    // Group logs by agent (exclude user messages)
    const agentMap = {};
    logs.forEach(log => {
      if (!log.isUser) {
        if (!agentMap[log.agent]) agentMap[log.agent] = [];
        agentMap[log.agent].push(log.content);
      }
    });
    // Create summary per agent
    return Object.entries(agentMap).map(([agent, contents]) => ({
      agent,
      summary: contents.join(' ')
    }));
  }
  const negotiationSummaries = getNegotiationSummary(negotiationLogs);
  
  // Generate PDF and set up for download
  useEffect(() => {
    if (reflectionData) {
      generatePdf();
    }
  }, [reflectionData]);
  
  // Generate PDF using jsPDF
  const generatePdf = async () => {
    try {
      console.log('Generating PDF...');
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set document properties
      doc.setProperties({
        title: 'CHALLENGE Policy Summary',
        subject: 'Refugee Education Policy Summary',
        author: 'CHALLENGE',
        creator: 'CHALLENGE App',
      });
      
      // Define colors
      const primaryTextColor = '#333333';
      const secondaryTextColor = '#666666';
      const accentColor = '#6E1E1E';
      
      // Set default font
      doc.setFont('helvetica');
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Current Y position for content placement
      let y = margin;
      
      // Add title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryTextColor);
      
      const title = 'CHALLENGE';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, y + 12);
      
      // Add subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const subtitle = 'Refugee Education Policy Summary';
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y + 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(secondaryTextColor);
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const dateText = `Generated on ${date}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, y + 26);
      
      y += 35;
      
      // Helper function to add a section title
      const addSectionTitle = (title: string) => {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColor);
        doc.text(title, margin, y);
        doc.setDrawColor(secondaryTextColor);
        doc.line(margin, y + 1, margin + contentWidth, y + 1);
        y += 8;
      };
      
      // Helper function to handle text wrapping
      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          doc.text(line, margin, y);
          y += fontSize / 4;
        }
        y += 2;
      };
      
      // Add Policies Section
      addSectionTitle('Selected Policies');
      
      const policies = getSelectedPolicyObjects();
      
      if (policies.length > 0) {
        for (const policy of policies) {
          // Policy title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryTextColor);
          addWrappedText(policy.title, 11, true);
          
          // Policy area and tier
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(secondaryTextColor);
          addWrappedText(`Area: ${policy.area} | Tier: ${policy.tier} | Impact: ${policy.impact}`, 9);
          
          y += 2;
        }
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No policies selected.', margin, y);
        y += 5;
      }
      
      y += 5;
      
      // Add Negotiation Summary Section
      if (negotiationSummaries.length > 0) {
        addSectionTitle('Stakeholder Negotiation Summary');
        negotiationSummaries.forEach(({ agent, summary }) => {
          addWrappedText(`${agent}: ${summary}`, 11, true);
          y += 2;
        });
      }
      
      // Add Reflections Section
      addSectionTitle('Reflection Responses');
      
      const reflections = reflectionData?.responses || {};
      const reflectionEntries = Object.entries(reflections);
      
      if (reflectionEntries.length > 0) {
        for (const [questionId, response] of reflectionEntries) {
          // Skip if response is empty
          if (!response || typeof response !== 'string' || !response.trim()) continue;
          
          // Get question text if available
          let questionText = `Question ${questionId}`;
          if (reflectionData?.questions) {
            const foundQuestion = reflectionData.questions.find(q => q.id === questionId);
            if (foundQuestion) questionText = foundQuestion.question;
          }
          
          // Question
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryTextColor);
          addWrappedText(questionText, 11, true);
          
          // Response
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          addWrappedText(response as string, 10);
          
          y += 5;
        }
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No reflections provided.', margin, y);
        y += 5;
      }
      
      // Create a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `challenge-summary-${timestamp}.pdf`;
      setPdfFilename(filename);
      
      // Create blob URL for download
      const url = URL.createObjectURL(doc.output('blob'));
      setDownloadUrl(url);
      setPdfGenerated(true);
      
      // Show success toast
      // toast({
      //   title: "PDF Generated Successfully",
      //   description: "Your summary is ready to download and send to your professor.",
      // });
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "There was a problem creating your summary. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle download PDF
  const handleDownloadPdf = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "PDF Downloaded",
        description: "Now you can email it to your professor using the button below.",
      });
    }
  };
  
  // Handle email PDF
  const handleEmailPdf = () => {
    // Open email client with pre-filled details
    const emailSubject = "CHALLENGE Policy Summary Submission";
    const emailBody = "Dear Professor,\n\nPlease find attached my completed policy summary for the CHALLENGE simulation.\n\nThank you,\nA Student";
    
    window.open(`mailto:kummarigunta.mohan@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    
    toast({
      title: "Email Client Opened",
      description: "Don't forget to attach the PDF you just downloaded!",
    });
  };
  
  // Count completed reflections
  const completedReflections = reflectionData ? Object.keys(reflectionData.responses).length : 0;
  const totalReflections = reflectionData ? reflectionData.questions.length : 0;
  
  if (!reflectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading summary data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      {/* 🔺 Rainbow Top Bar */}
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
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-4xl w-full">
          {/* White rounded rectangle background for title and subtitle */}
          <div className="bg-white rounded-full py-8 px-8 mb-12 shadow-lg">
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
              Your refugee education policy journey summarized
            </p>
          </div>
          {/* Main Content */}
          <div className="space-y-8">
            {/* Negotiation Summary Section */}
            {negotiationSummaries.length > 0 && (
              <Card className="bg-white transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bebas">Stakeholder Negotiation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {negotiationSummaries.map(({ agent, summary }) => (
                      <li key={agent}>
                        <span className="font-semibold text-policy-maroon">{agent}:</span> {summary}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {/* Policy Package Summary */}
            <Card className="bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bebas">Your Policy Package</CardTitle>
                <CardDescription>
                  You selected {getSelectedPolicyObjects().length} policies across {new Set(getSelectedPolicyObjects().map(p => p.area)).size} areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSelectedPolicyObjects().map((policy) => (
                    <div key={policy.id} className="border rounded-md p-3 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{policy.title}</h3>
                        <Badge variant="outline">{policy.area}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                      <div className="mt-auto pt-2 flex justify-between text-xs text-gray-500">
                        <span>Tier {policy.tier}</span>
                        <span>Impact: {policy.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Equity Score */}
            <Card className="bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bebas">Equity Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-hope-turquoise h-6 rounded-full" 
                        style={{ width: `${(reflectionData.equityScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-xl">{reflectionData.equityScore}/5</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on UNESCO inclusion metrics for refugee education
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* AI Feedback */}
            <Card className="bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bebas">Policy Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {aiFeedback ? (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-4 rounded-md border-l-4 border-hope-turquoise">
                      {aiFeedback.split('\n\n').map((paragraph, i) => (
                        <p key={i} className={i === 0 ? "font-medium" : ""}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No policy analysis available.</p>
                )}
              </CardContent>
            </Card>
            {/* Reflection Highlights */}
            <Card className="bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bebas">Your Reflections</CardTitle>
                <CardDescription>
                  {completedReflections} of {totalReflections} reflections completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reflectionData.responses).map(([questionId, response]) => {
                    const question = reflectionData.questions.find(q => q.id === questionId);
                    if (!question) return null;
                    return (
                      <div key={questionId} className="border-b pb-4">
                        <div className="flex items-start gap-2">
                          <h3 className="font-semibold">{question.question}</h3>
                          <Badge variant="outline" className="text-xs">
                            {question.category}
                          </Badge>
                        </div>
                        <p className="mt-2 text-gray-700">{response as string}</p>
                      </div>
                    );
                  })}
                  {completedReflections === 0 && (
                    <p className="text-gray-500 italic">No reflections completed yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Navigation */}
            <div className="flex justify-center mt-8">
              <Button 
                className="bg-policy-maroon text-white hover:bg-opacity-90"
                onClick={() => router.push('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* 🔻 Rainbow Bottom Bar */}
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
    </div>
  );
}