'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, InvestigationCase } from '@/lib/cases-store';
import { updateMessages } from '@/lib/cases-store';

function makeId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useInterviewStream(caseData: InvestigationCase) {
  const [messages, setMessages] = useState<ChatMessage[]>(caseData.messages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      updateMessages(caseData.id, msgs);
    },
    [caseData.id]
  );

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (isStreaming) return;

      // Add user message (skip if it's the internal start trigger)
      const isStartTrigger = userContent === '[START_INTERVIEW]';
      let nextMessages = messages;

      if (!isStartTrigger) {
        const userMsg: ChatMessage = {
          id: makeId(),
          role: 'user',
          content: userContent,
          timestamp: Date.now(),
        };
        nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        persistMessages(nextMessages);
      }

      setIsStreaming(true);
      setStreamingContent('');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: nextMessages,
            caseContext: caseData,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();

            if (payload === '[DONE]') {
              // Finalize the assistant message
              const assistantMsg: ChatMessage = {
                id: makeId(),
                role: 'assistant',
                content: accumulated,
                timestamp: Date.now(),
              };
              const finalMessages = [...nextMessages, assistantMsg];
              setMessages(finalMessages);
              persistMessages(finalMessages);
              setStreamingContent('');
              setIsStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Stream error:', err);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        abortRef.current = null;
      }
    },
    [isStreaming, messages, caseData, persistMessages]
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, streamingContent, sendMessage, stopStream };
}
