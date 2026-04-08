import styles from './Loading.module.css';

export default function Loading({ size = 'medium', text = 'Loading...' }) {
  return (
    <div className={styles.loading}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}