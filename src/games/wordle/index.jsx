import styles from './Wordle.module.css';

export default function WordleGame({ onScore }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Wordle</h2>
      <p className={styles.sub}>Guess the 5-letter word in 6 tries.</p>
      <div className={styles.comingSoon}>
        <span>🚧</span>
        <p>Game coming soon!</p>
        <p className={styles.hint}>Logic and UI will be built in the next step.</p>
      </div>
    </div>
  );
}
