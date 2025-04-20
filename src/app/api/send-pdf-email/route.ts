import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

// Helper function for consistent logging
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📧 PDF EMAIL: ${step}`);
  if (details) {
    console.log('  Details:', typeof details === 'string' ? details : JSON.stringify(details, null, 2));
  }
};

export async function POST(req: NextRequest) {
  try {
    logStep('Starting PDF email process');
    const { pdfData, reflectionData, selectedPolicies } = await req.json();
    logStep('Received request data', { 
      hasPdfData: !!pdfData, 
      hasReflectionData: !!reflectionData,
      policiesCount: selectedPolicies?.length || 0 
    });

    // Create a test account using Ethereal
    logStep('Creating Ethereal test account');
    const testAccount = await nodemailer.createTestAccount();
    logStep('Ethereal account created', {
      user: testAccount.user,
      pass: testAccount.pass.substring(0, 3) + '...',
    });

    // Create a transporter using Ethereal
    logStep('Creating Ethereal SMTP transporter');
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    logStep('SMTP configuration', { 
      host: 'smtp.ethereal.email',
      port: 587,
      user: testAccount.user,
    });

    // Create a PDF if not provided
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
      logStep('Adding policies to PDF');
      addSectionTitle('Selected Policies');
      
      if (selectedPolicies && selectedPolicies.length > 0) {
        logStep(`Adding ${selectedPolicies.length} policies to PDF`);
        for (const policy of selectedPolicies) {
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
        logStep('No policies to add to PDF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No policies selected.', margin, y);
        y += 5;
      }
      
      y += 5;
      
      // Add Reflections Section
      logStep('Adding reflections to PDF');
      addSectionTitle('Reflection Responses');
      
      const reflections = reflectionData?.responses || {};
      const reflectionEntries = Object.entries(reflections);
      
      if (reflectionEntries.length > 0) {
        logStep(`Adding ${reflectionEntries.length} reflections to PDF`);
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
        logStep('No reflections to add to PDF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No reflections provided.', margin, y);
        y += 5;
      }
      
      logStep('Finalizing PDF document');
      // Convert the PDF to a buffer
      pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    }

    // Current date for the email subject
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send the email with the PDF attachment
    logStep('Preparing to send email', { recipient: 'sankritya09.02@gmail.com' });
    const info = await transporter.sendMail({
      from: `"CHALLENGE App" <${testAccount.user}>`,
      to: 'sankritya09.02@gmail.com', // Fixed recipient email
      subject: `CHALLENGE Policy Summary - ${currentDate}`,
      text: `Dear Professor,

Please find attached the completed policy summary for the CHALLENGE simulation.

Thank you,
A Student`,
      attachments: [
        {
          filename: `challenge-summary-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // Log the Ethereal URL where the email can be viewed
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logStep('Email sent successfully', { 
      messageId: info.messageId,
      previewUrl
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully', 
      messageId: info.messageId,
      previewUrl
    }, { status: 200 });
  } catch (error: any) {
    logStep('Error sending email', { error: error.message, stack: error.stack });
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error: error.message },
      { status: 500 }
    );
  }
}
