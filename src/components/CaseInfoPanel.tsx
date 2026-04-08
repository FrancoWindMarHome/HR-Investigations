'use client';

import { useState } from 'react';
import type { InvestigationCase, CaseStatus } from '@/lib/cases-store';
import { updateStatus } from '@/lib/cases-store';
import styles from './CaseInfoPanel.module.css';

interface CaseInfoPanelProps {
  caseData: InvestigationCase;
  onStatusChange?: (status: CaseStatus) => void;
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  complete: 'Complete',
};

export default function CaseInfoPanel({ caseData, onStatusChange }: CaseInfoPanelProps) {
  const [status, setStatus] = useState<CaseStatus>(caseData.status);

  const handleMarkComplete = () => {
    const next: CaseStatus = 'complete';
    updateStatus(caseData.id, next);
    setStatus(next);
    onStatusChange?.(next);
  };

  const handleMarkActive = () => {
    const next: CaseStatus = 'active';
    updateStatus(caseData.id, next);
    setStatus(next);
    onStatusChange?.(next);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>Case Details</div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Case #</span>
          <span className={styles.fieldVal}>{caseData.caseNumber}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Employee</span>
          <span className={styles.fieldVal}>{caseData.employeeName}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Category</span>
          <span className={styles.fieldVal}>{caseData.category}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Department</span>
          <span className={styles.fieldVal}>{caseData.department}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Supervisor</span>
          <span className={styles.fieldVal}>{caseData.supervisor}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Opened</span>
          <span className={styles.fieldVal}>{caseData.dateOpened}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <span className={`${styles.badge} ${styles[`b_${status}`]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Messages</span>
          <span className={styles.fieldVal}>{caseData.messages.length}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {status !== 'complete' && (
          <button className={styles.btnComplete} onClick={handleMarkComplete}>
            Mark Complete
          </button>
        )}
        {status === 'pending' && (
          <button className={styles.btnActive} onClick={handleMarkActive}>
            Mark Active
          </button>
        )}
        {status === 'complete' && (
          <div className={styles.closedNote}>Case closed</div>
        )}
      </div>

      <div className={styles.lawNote}>
        <div className={styles.lawNoteTitle}>Applicable Law</div>
        <div className={styles.lawNoteText}>
          {caseData.category === 'Harassment' || caseData.category === 'Sexual Harassment'
            ? 'Act 17 (1988) · Title VII'
            : caseData.category === 'Discrimination'
            ? 'Act 100 (1959) · Title VII · ADEA'
            : caseData.category === 'Retaliation'
            ? 'Act 115 (1991)'
            : caseData.category === 'Attendance'
            ? 'FMLA · Act 4 (2017)'
            : caseData.category === 'Workplace Conduct'
            ? 'Act 80 (1976) · Act 4 (2017)'
            : 'Act 100 · Act 80 · Title VII'}
        </div>
      </div>
    </div>
  );
}
