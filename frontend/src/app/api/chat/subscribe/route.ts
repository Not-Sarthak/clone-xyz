import { NextResponse } from 'next/server';
import { chatService } from '@/ai/ai-service';

export async function POST() {
  console.log('🟡 Subscribing to chat...');
  try {
    const result = await chatService.getLatestResponse();

    if (!result) {
      return NextResponse.json(
        { error: 'No chat response available yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assistantId: result.assistantId,
      threadId: result.threadId,
      content: result.text.value
    });
  } catch (error) {
    console.error('Chat subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to chat' },
      { status: 500 }
    );
  }
}