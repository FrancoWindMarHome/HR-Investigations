'use client';

import { useRouter } from 'next/navigation';
import type { InvestigationCase } from '@/lib/cases-store';
import styles from './CaseItem.module.css';

const ICON_BG: Record<string, string> = {
  active: 'rgba(29,66,155,0.1)',
  pending: 'rgba(248,155,36,0.1)',
  complete: 'rgba(102,102,102,0.1)',
};

const ICON: Record<string, string> = {
  active: '📋',
  pending: '⚠',
  complete: '📋',
};

interface CaseItemProps {
  c: InvestigationCase;
  highlighted?: boolean;
}

export default function CaseItem({ c, highlighted }: CaseItemProps) {
  const router = useRouter();

  return (
    <div
      className={`${styles.ci} ${highlighted ? styles.highlighted : ''}`}
      onClick={() => router.push(`/interview/${c.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/interview/${c.id}`)}
    >
      <div className={styles.ciIco} style={{ background: ICON_BG[c.status] ?? 'rgba(102,102,102,0.1)' }}>
        {ICON[c.status] ?? '📋'}
      </div>
      <div className={styles.ciInfo}>
        <div className={styles.ciName}>
          {c.employeeName}
          <span className={styles.ciCategory}> · {c.category}</span>
        </div>
        <div className={styles.ciMeta}>
          {c.caseNumber} · {c.department} · Sup: {c.supervisor} · {c.dateOpened}
        </div>
      </div>
      <div className={`${styles.badge} ${styles[`b_${c.status}`]}`}>
        {c.status === 'complete' ? 'Complete' : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
      </div>
    </div>
  );
}
