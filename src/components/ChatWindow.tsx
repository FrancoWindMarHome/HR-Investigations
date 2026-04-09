'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/cases-store';
import MessageBubble from './MessageBubble';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
}

export default function ChatWindow({ messages, isStreaming, streamingContent }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className={styles.window}>
      <div className={styles.inner}>
        {messages.length === 0 && !isStreaming && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>⚖</div>
            <div className={styles.emptyText}>Starting interview…</div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
            streaming
          />
        )}

        {isStreaming && !streamingContent && (
          <div className={styles.typing}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
