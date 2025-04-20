import { NextRequest, NextResponse } from 'next/server';
import { generatePdfBuffer } from '../../../lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Format the current date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Add date to data
    const pdfData = {
      ...data,
      date,
    };
    
    console.log('Generating PDF...');
    
    try {
      // Extract policies and reflections from the data
      const { policies = [], reflections = [] } = pdfData;
      
      // Generate PDF buffer using our helper function
      const pdfBuffer = await generatePdfBuffer(policies, reflections);
      console.log('PDF generated successfully');
      
      // Convert buffer to base64
      const pdfBase64 = pdfBuffer.toString('base64');
      
      return NextResponse.json({ 
        success: true,
        pdfBase64
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json({ 
        error: 'PDF generation failed', 
        message: pdfError instanceof Error ? pdfError.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
