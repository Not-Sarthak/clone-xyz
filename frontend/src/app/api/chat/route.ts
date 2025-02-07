import { NextResponse } from 'next/server';
import { chatService } from '@/ai/ai-service';

export async function POST(req: Request) {
  try {
    const { message, selectedNetwork, threadId } = await req.json();

    console.log('Processing message:', message);
    
    const result = await chatService.processMessage(
      threadId,
      message,
      selectedNetwork
    );

    console.log('Chat API result:', result);

    if ('text' in result) {
      return NextResponse.json({ content: result.text.value });
    }

    return NextResponse.json(
      { error: 'Unable to process message' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}