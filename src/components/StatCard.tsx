import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
  variant: 'navy' | 'orange' | 'blue' | 'lightblue';
}

export default function StatCard({ label, value, detail, variant }: StatCardProps) {
  return (
    <div className={`${styles.sc} ${styles[variant]}`}>
      <div className={styles.slbl}>{label}</div>
      <div className={styles.sval}>{value}</div>
      <div className={`${styles.sd} ${styles[`sd_${variant}`] ?? ''}`}>{detail}</div>
    </div>
  );
}
