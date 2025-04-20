import { NextRequest, NextResponse } from 'next/server';
import { generateNegotiationSummary } from '@/lib/ai-negotiation/groq-summary';

export async function POST(request: NextRequest) {
  try {
    const { negotiationLogs } = await request.json();
    
    // Validate required parameters
    if (!negotiationLogs || !Array.isArray(negotiationLogs)) {
      return NextResponse.json(
        { error: 'Missing or invalid negotiation logs' },
        { status: 400 }
      );
    }
    
    // Generate the summary using the library function
    const summary = await generateNegotiationSummary(negotiationLogs);
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating negotiation summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}