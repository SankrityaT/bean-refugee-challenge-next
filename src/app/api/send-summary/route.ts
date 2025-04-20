import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // You can implement email sending logic here similar to send-pdf-email
    // For now, we'll just return a success response
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-summary API:', error);
    return NextResponse.json(
      { error: 'Failed to process summary' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Send summary API endpoint' });
}
