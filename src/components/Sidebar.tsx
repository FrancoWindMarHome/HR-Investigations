'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { InvestigationCase } from '@/lib/cases-store';
import styles from './Sidebar.module.css';

interface SidebarProps {
  cases: InvestigationCase[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--orange)',
  active: 'var(--lightblue)',
  complete: 'var(--grey)',
};

const STATUS_ABBR: Record<string, string> = {
  pending: 'pend',
  active: 'acti',
  complete: 'comp',
};

export default function Sidebar({ cases }: SidebarProps) {
  const pathname = usePathname();

  const isDashboard = pathname === '/';

  return (
    <div className={styles.sb}>
      {/* Logo */}
      <div className={styles.sbLogo}>
        <div className={styles.sbLogoRow}>
          <div className={styles.sbIcon}>⚖</div>
          <div className={styles.sbName}>HR Insight</div>
        </div>
        <div className={styles.sbSub}>WindMar Energy · v2</div>
      </div>

      {/* User */}
      <div className={styles.sbUser}>
        <div className={styles.av}>FR</div>
        <div>
          <div className={styles.uname}>Franco</div>
          <div className={styles.urole}>Administrator</div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.sbNav}>
        <div className={styles.navLbl}>Workspace</div>

        <Link
          href="/"
          className={`${styles.ni} ${isDashboard ? styles.active : ''}`}
        >
          <span
            className={styles.nd}
            style={{ background: isDashboard ? 'var(--lightblue)' : 'rgba(255,255,255,0.25)' }}
          />
          Dashboard
          <span className={styles.nb}>{cases.length}</span>
        </Link>

        <Link
          href="/interview/new"
          className={`${styles.ni} ${pathname === '/interview/new' ? styles.active : ''}`}
        >
          <span className={styles.nd} style={{ background: 'rgba(255,255,255,0.25)' }} />
          New Interview
        </Link>

        <div className={styles.navLbl} style={{ marginTop: 8 }}>Cases</div>

        {cases.slice(0, 6).map((c) => {
          const isActive = pathname === `/interview/${c.id}`;
          const lastName = c.employeeName.split(' ')[1] ?? c.employeeName;
          const firstInitial = c.employeeName[0];
          const displayName = `${lastName}, ${firstInitial}.`;
          return (
            <Link
              key={c.id}
              href={`/interview/${c.id}`}
              className={`${styles.ni} ${isActive ? styles.active : ''}`}
            >
              <span
                className={styles.nd}
                style={{ background: STATUS_COLOR[c.status] ?? 'var(--grey)' }}
              />
              <span className={styles.niLabel}>{displayName}</span>
              <span
                className={`${styles.nb} ${c.status === 'pending' ? styles.nbW : ''}`}
              >
                {STATUS_ABBR[c.status] ?? c.status}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Gradient bar */}
      <div className={styles.sbBar} />

      {/* Footer */}
      <div className={styles.sbFoot}>
        <span className={styles.dotLive} />
        Claude API · Live
      </div>
    </div>
  );
}
