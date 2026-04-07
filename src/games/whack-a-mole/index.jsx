import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './WhackAMole.module.css';

const HOLES = 9;
const GAME_TIME = 25;
const SPAWN_INTERVAL = 800;

export default function WhackAMoleGame() {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_TIME);
  const [activeHole, setActiveHole] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const holes = useMemo(() => Array.from({ length: HOLES }), []);

  const resetGame = () => {
    setScore(0);
    setTime(GAME_TIME);
    setActiveHole(-1);
    setPlaying(false);
    setGameOver(false);
  };

  const startGame = () => {
    setScore(0);
    setTime(GAME_TIME);
    setGameOver(false);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    intervalRef.current = window.setInterval(() => {
      setActiveHole(Math.floor(Math.random() * HOLES));
    }, SPAWN_INTERVAL);

    return () => window.clearInterval(intervalRef.current);
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current);
          setPlaying(false);
          setGameOver(true);
          setActiveHole(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [playing]);

  const handleHit = (index) => {
    if (!playing || index !== activeHole) return;
    setScore((prev) => prev + 1);
    setActiveHole(-1);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Whack-a-Mole</h2>
          <p className={styles.subtitle}>Tap the moles before they disappear.</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Time</span>
            <strong>{time}s</strong>
          </div>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.grid}>
          {holes.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.hole} ${activeHole === index ? styles.active : ''}`}
              onClick={() => handleHit(index)}
            >
              {activeHole === index ? '🐹' : ''}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={startGame}>
            {playing ? 'Playing...' : gameOver ? 'Play Again' : 'Start Game'}
          </button>
          <button className={styles.secondaryButton} type="button" onClick={resetGame}>
            Reset
          </button>
        </div>

        {gameOver && <div className={styles.message}>Time’s up! Final score: {score}</div>}
      </div>
    </div>
  );
}
