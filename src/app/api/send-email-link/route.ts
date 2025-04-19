import { NextRequest, NextResponse } from 'next/server';

// Helper function for consistent logging
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📧 EMAIL LINK: ${step}`);
  if (details) {
    console.log('  Details:', typeof details === 'string' ? details : JSON.stringify(details, null, 2));
  }
};

export async function POST(req: NextRequest) {
  try {
    logStep('Starting email link process');
    const { previewUrl, studentName = 'A Student' } = await req.json();
    
    if (!previewUrl) {
      logStep('Error: No preview URL provided');
      return NextResponse.json(
        { success: false, message: 'No preview URL provided' },
        { status: 400 }
      );
    }

    logStep('Sending email with preview link', { previewUrl });

    // Prepare the email data
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: 'sankritya09.02@gmail.com',
        from_name: 'CHALLENGE App',
        to_name: 'Professor',
        subject: `CHALLENGE Policy Summary - ${new Date().toLocaleDateString()}`,
        message: `A student has completed the CHALLENGE simulation. You can view and download their PDF summary at the following link:\n\n${previewUrl}\n\nThis link will allow you to view the complete PDF with their policy choices and reflection responses.`,
        student_name: studentName,
        pdf_link: previewUrl
      }
    };

    // Send the email using EmailJS API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      logStep('Email sent successfully');
      return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });
    } else {
      const errorText = await response.text();
      logStep('Error sending email', { status: response.status, error: errorText });
      return NextResponse.json(
        { success: false, message: 'Failed to send email', error: errorText },
        { status: response.status }
      );
    }
  } catch (error: any) {
    logStep('Error in email process', { error: error.message, stack: error.stack });
    console.error('Error sending email link:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email link', error: error.message },
      { status: 500 }
    );
  }
}
