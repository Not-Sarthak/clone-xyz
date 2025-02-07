import OpenAI from 'openai';
import { createAssistant } from './openai/create-assistant';
import { createThread } from './openai/create-thread';
import { createRun } from './openai/create-run';
import { performRun } from './openai/perform-run';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Assistant } from 'openai/resources/beta/assistants';

class ChatService {
  private client: OpenAI;
  private assistant: Assistant | null = null;
  private threads: Map<string, Thread> = new Map();

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getOrCreateAssistant() {
    if (!this.assistant) {
      this.assistant = await createAssistant(this.client);
    }
    return this.assistant;
  }

  async getOrCreateThread(threadId: string) {
    let thread = this.threads.get(threadId);
    if (!thread) {
      thread = await createThread(this.client);
      this.threads.set(threadId, thread);
    }
    return thread;
  }

  async processMessage(threadId: string, message: string, network: string) {
    try {
      const assistant = await this.getOrCreateAssistant();
      const thread = await this.getOrCreateThread(threadId);

      const messageWithContext = `[Network: ${network}] ${message}`;
      
      await this.client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: messageWithContext
      });

      const run = await createRun(this.client, thread, assistant.id);
      return await performRun(run as any, this.client, thread);
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();