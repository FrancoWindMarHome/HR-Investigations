'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import CaseItem from '@/components/CaseItem';
import { getCases, createCase, getCaseStats } from '@/lib/cases-store';
import type { InvestigationCase } from '@/lib/cases-store';
import styles from './page.module.css';

const CATEGORIES = [
  'Workplace Conduct',
  'Harassment',
  'Sexual Harassment',
  'Discrimination',
  'Retaliation',
  'Attendance',
  'Pay/Compensation',
  'Other',
];

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employeeName: '',
    category: 'Workplace Conduct',
    department: '',
    supervisor: '',
  });

  useEffect(() => {
    setCases(getCases());
  }, []);

  const stats = getCaseStats(cases);

  const handleCreate = () => {
    if (!form.employeeName.trim() || !form.department.trim() || !form.supervisor.trim()) return;
    const newCase = createCase({
      employeeName: form.employeeName.trim(),
      category: form.category,
      department: form.department.trim(),
      supervisor: form.supervisor.trim(),
    });
    setCases(getCases());
    setShowModal(false);
    setForm({ employeeName: '', category: 'Workplace Conduct', department: '', supervisor: '' });
    router.push(`/interview/${newCase.id}`);
  };

  return (
    <div className={styles.wrap}>
      <Sidebar cases={cases} />

      <div className={styles.main}>
        {/* Header */}
        <div className={styles.hdr}>
          <div>
            <div className={styles.hdrTitle}>Investigation Cases</div>
            <div className={styles.hdrSub}>HR · WindMar Energy · 2026</div>
          </div>
          <button className={styles.hdrBtn} onClick={() => setShowModal(true)}>
            + New Interview
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Stats */}
          <div className={styles.stats}>
            <StatCard label="Total Cases" value={stats.total} detail="all time" variant="navy" />
            <StatCard label="Pending" value={stats.pending} detail="awaiting interview" variant="orange" />
            <StatCard label="Active" value={stats.active} detail="in progress" variant="blue" />
            <StatCard label="Completed" value={stats.complete} detail="signed & closed" variant="lightblue" />
          </div>

          {/* Cases list */}
          <div className={styles.caseLbl}>All Cases</div>
          <div className={styles.cl}>
            {cases.map((c, i) => (
              <CaseItem key={c.id} c={c} highlighted={i === 0} />
            ))}
          </div>
        </div>
      </div>

      {/* New Interview Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>New Investigation Interview</div>

            <label className={styles.lbl}>Employee Name</label>
            <input
              className={styles.inp}
              type="text"
              value={form.employeeName}
              onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
              placeholder="Full name"
              autoFocus
            />

            <label className={styles.lbl}>Category</label>
            <select
              className={styles.inp}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label className={styles.lbl}>Department</label>
            <input
              className={styles.inp}
              type="text"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="e.g. Operations"
            />

            <label className={styles.lbl}>Direct Supervisor</label>
            <input
              className={styles.inp}
              type="text"
              value={form.supervisor}
              onChange={(e) => setForm((f) => ({ ...f, supervisor: e.target.value }))}
              placeholder="Supervisor full name"
            />

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className={styles.btnCreate}
                onClick={handleCreate}
                disabled={!form.employeeName.trim() || !form.department.trim() || !form.supervisor.trim()}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
