import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key or use a placeholder for build process
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build_process');

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST EMAIL API ===');
    console.log(`Using Resend API Key: ${process.env.RESEND_API_KEY ? 'Key is set (starts with ' + process.env.RESEND_API_KEY.substring(0, 5) + '...)' : 'Key is NOT set'}`);
    console.log(`ADMIN_EMAIL env var: ${process.env.ADMIN_EMAIL}`);
    
    const recipientEmail = process.env.ADMIN_EMAIL || 'sankritya09.02@gmail.com';
    
    try {
      // Send a simple test email
      const result = await resend.emails.send({
        from: 'Test <onboarding@resend.dev>',
        to: recipientEmail,
        subject: 'Test Email from CHALLENGE App',
        html: '<h1>Test Email</h1><p>This is a test email to verify that the Resend API is working correctly.</p>',
      });
      
      console.log('Resend API response:', JSON.stringify(result, null, 2));
      
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${recipientEmail}`,
        result
      });
    } catch (resendError) {
      console.error('Resend API error:', resendError);
      console.error('Error details:', JSON.stringify(resendError, null, 2));
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: resendError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test-email API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
