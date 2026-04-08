import { Link } from 'react-router-dom';
import styles from './GameLayout.module.css';

export default function GameLayout({ title, subtitle, score, children, controls, gameColor }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Link to="/" className={styles.backButton}>
              ← Back to Games
            </Link>
            <div className={styles.titleInfo}>
              <div
                className={styles.gameIcon}
                style={{ backgroundColor: gameColor }}
              >
                {title.charAt(0)}
              </div>
              <div>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            {score !== undefined && (
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>Score</span>
                <strong className={styles.scoreValue}>{score.toLocaleString()}</strong>
              </div>
            )}
            {controls && <div className={styles.controls}>{controls}</div>}
          </div>
        </div>

        <div className={styles.gameContent}>
          {children}
        </div>
      </div>
    </div>
  );
}