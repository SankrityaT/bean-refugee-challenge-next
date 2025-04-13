import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { reflectionText, questionId } = data;
    
    // In a real implementation, this would save the reflection to a database
    // For now, we'll just echo it back with a timestamp
    
    return NextResponse.json({
      id: Math.random().toString(36).substring(2, 9),
      questionId,
      text: reflectionText,
      timestamp: new Date().toISOString(),
      saved: true
    });
  } catch (error) {
    console.error('Error in reflection API:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get question ID from query params
  const url = new URL(request.url);
  const questionId = url.searchParams.get('questionId');
  
  if (!questionId) {
    return NextResponse.json(
      { error: 'Question ID is required' },
      { status: 400 }
    );
  }
  
  // In a real implementation, this would fetch saved reflections from a database
  // For now, we'll return a mock response
  
  return NextResponse.json({
    id: Math.random().toString(36).substring(2, 9),
    questionId,
    text: "This is a previously saved reflection for this question.",
    timestamp: new Date().toISOString()
  });
}