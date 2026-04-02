import styles from './PlaceholderPage.module.css';

export default function ProfilePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>
      <p className={styles.sub}>Sign in to track your scores and streaks.</p>
    </div>
  );
}
