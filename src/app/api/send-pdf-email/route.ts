import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

// Helper function for consistent logging
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📧 PDF EMAIL: ${step}`);
  if (details) {
    console.log('  Details:', typeof details === 'string' ? details : JSON.stringify(details, null, 2));
  }
};

// Only generate and return the PDF as base64. No email sending here!
export async function POST(req: NextRequest) {
  try {
    logStep('Starting PDF generation process');
    const { pdfData, reflectionData, selectedPolicies } = await req.json();
    logStep('Received request data', { 
      hasPdfData: !!pdfData, 
      hasReflectionData: !!reflectionData,
      policiesCount: selectedPolicies?.length || 0 
    });

    let pdfBuffer;
    if (pdfData) {
      logStep('Using provided PDF data');
      // If PDF data is provided as base64, convert it to buffer
      pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64');
    } else {
      logStep('Generating new PDF document');
      // Generate PDF on the server
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      doc.setProperties({
        title: 'CHALLENGE Policy Summary',
        subject: 'Refugee Education Policy Summary',
        author: 'CHALLENGE',
        creator: 'CHALLENGE App',
      });
      const primaryTextColor = '#333333';
      const secondaryTextColor = '#666666';
      const accentColor = '#6E1E1E';
      doc.setFont('helvetica');
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryTextColor);
      const title = 'CHALLENGE';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, y + 12);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const subtitle = 'Refugee Education Policy Summary';
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y + 20);
      doc.setFontSize(10);
      doc.setTextColor(secondaryTextColor);
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const dateText = `Generated on ${date}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, (pageWidth - dateWidth) / 2, y + 26);
      y += 35;
      // Policies
      logStep('Adding policies to PDF');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor);
      doc.text('Selected Policies', margin, y);
      y += 8;
      if (selectedPolicies && selectedPolicies.length > 0) {
        logStep(`Adding ${selectedPolicies.length} policies to PDF`);
        for (const policy of selectedPolicies) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryTextColor);
          doc.text(policy.title, margin, y);
          y += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(secondaryTextColor);
          doc.text(`Area: ${policy.area} | Tier: ${policy.tier} | Impact: ${policy.impact}`, margin, y);
          y += 5;
        }
      } else {
        logStep('No policies to add to PDF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No policies selected.', margin, y);
        y += 5;
      }
      y += 5;
      // Reflections
      logStep('Adding reflections to PDF');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor);
      doc.text('Reflection Responses', margin, y);
      y += 8;
      const reflections = reflectionData?.responses || {};
      const reflectionEntries = Object.entries(reflections);
      if (reflectionEntries.length > 0) {
        logStep(`Adding ${reflectionEntries.length} reflections to PDF`);
        for (const [questionId, response] of reflectionEntries) {
          if (!response || typeof response !== 'string' || !response.trim()) continue;
          let questionText = `Question ${questionId}`;
          if (reflectionData?.questions) {
            const foundQuestion = reflectionData.questions.find(q => q.id === questionId);
            if (foundQuestion) questionText = foundQuestion.question;
          }
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryTextColor);
          doc.text(questionText, margin, y);
          y += 5;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(response as string, margin, y);
          y += 5;
        }
      } else {
        logStep('No reflections to add to PDF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No reflections provided.', margin, y);
        y += 5;
      }
      logStep('Finalizing PDF document');
      // Finalize PDF
      pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    }
    // Return PDF as base64 string
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error: any) {
    logStep('Error generating PDF', { error: error.message, stack: error.stack });
    console.error('Error generating PDF:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate PDF', error: error.message }, { status: 500 });
  }
}
