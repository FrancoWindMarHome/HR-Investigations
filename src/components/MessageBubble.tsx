import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/lib/cases-store';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
  streaming?: boolean;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message, streaming }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`${styles.row} ${isAssistant ? styles.assistantRow : styles.userRow}`}>
      {isAssistant && (
        <div className={styles.avatarAssistant} title="Karla — HR Agent">
          IS
        </div>
      )}

      <div className={`${styles.bubble} ${isAssistant ? styles.assistantBubble : styles.userBubble}`}>
        {isAssistant ? (
          <div className={styles.markdown}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {streaming && <span className={styles.cursor} />}
          </div>
        ) : (
          <p className={styles.userText}>{message.content}</p>
        )}
        <div className={styles.ts}>{formatTime(message.timestamp)}</div>
      </div>

      {!isAssistant && (
        <div className={styles.avatarUser} title="Franco — Administrator">
          FR
        </div>
      )}
    </div>
  );
}
