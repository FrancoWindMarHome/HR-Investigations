'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import CaseInfoPanel from '@/components/CaseInfoPanel';
import { getCases, getCase } from '@/lib/cases-store';
import type { InvestigationCase } from '@/lib/cases-store';
import { useInterviewStream } from '@/hooks/useInterviewStream';
import styles from './page.module.css';

function InterviewSession({ caseData }: { caseData: InvestigationCase }) {
  const [allCases, setAllCases] = useState<InvestigationCase[]>([]);
  const { messages, isStreaming, streamingContent, sendMessage } = useInterviewStream(caseData);
  const started = useInterviewStarted(messages, isStreaming, sendMessage);

  useEffect(() => {
    setAllCases(getCases());
  }, []);

  return (
    <div className={styles.wrap}>
      <Sidebar cases={allCases} />

      <div className={styles.main}>
        {/* Header */}
        <div className={styles.hdr}>
          <div>
            <div className={styles.hdrTitle}>
              {caseData.employeeName}
              <span className={styles.hdrCategory}> · {caseData.category}</span>
            </div>
            <div className={styles.hdrSub}>
              {caseData.caseNumber} · {caseData.department} · Karla — HR Agent
            </div>
          </div>
          <div className={`${styles.statusBadge} ${styles[`b_${caseData.status}`]}`}>
            {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
          </div>
        </div>

        {/* Chat + info panel */}
        <div className={styles.chatArea}>
          <div className={styles.chatMain}>
            <ChatWindow
              messages={messages}
              isStreaming={isStreaming || !started}
              streamingContent={streamingContent}
            />
            <ChatInput onSend={sendMessage} disabled={isStreaming || !started} />
          </div>
          <CaseInfoPanel
            caseData={{ ...caseData, messages }}
            onStatusChange={() => setAllCases(getCases())}
          />
        </div>
      </div>
    </div>
  );
}

function useInterviewStarted(
  messages: ReturnType<typeof useInterviewStream>['messages'],
  isStreaming: boolean,
  sendMessage: (content: string) => void
) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (messages.length === 0 && !isStreaming && !started) {
      setStarted(true);
      sendMessage('[START_INTERVIEW]');
    } else if (messages.length > 0) {
      setStarted(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return started;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;

  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = getCase(caseId);
    if (!c) {
      router.push('/');
      return;
    }
    setCaseData(c);
    setLoading(false);
  }, [caseId, router]);

  if (loading || !caseData) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading case…</div>
      </div>
    );
  }

  return <InterviewSession caseData={caseData} />;
}
