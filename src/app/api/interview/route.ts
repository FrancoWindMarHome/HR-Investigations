import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { buildHRAgentSystemPrompt } from '@/lib/hr-agent-prompt';
import type { InvestigationCase, ChatMessage } from '@/lib/cases-store';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: ChatMessage[];
      caseContext: InvestigationCase;
    };

    const { messages, caseContext } = body;

    if (!caseContext) {
      return new Response('Missing caseContext', { status: 400 });
    }

    const systemPrompt = buildHRAgentSystemPrompt(caseContext);

    // Convert our ChatMessage format to Anthropic's message format
    const anthropicMessages: Anthropic.MessageParam[] = messages
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // If no messages yet, seed with a trigger to start the interview
    if (anthropicMessages.length === 0) {
      anthropicMessages.push({
        role: 'user',
        content: '[START_INTERVIEW]',
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          });

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
