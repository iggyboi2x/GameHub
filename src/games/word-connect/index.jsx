import { useMemo, useState } from 'react';
import styles from './WordConnect.module.css';

const WORDS = [
  'planet',
  'garden',
  'mirror',
  'forest',
  'window',
  'listen',
  'danger',
  'master',
  'silver',
  'stream',
];

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomWord(exclude) {
  const options = WORDS.filter((word) => word !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

export default function WordConnectGame() {
  const [target, setTarget] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase());
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('Link the tiles to form the secret word.');
  const [score, setScore] = useState(0);

  const letters = useMemo(() => shuffle(target.split('')), [target]);
  const currentWord = selected.join('');

  const handleTileClick = (letter, index) => {
    if (selected.length >= target.length) return;
    setSelected((prev) => [...prev, { letter, index }]);
  };

  const handleRemove = () => {
    setSelected((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentWord) {
      setMessage('Choose at least one letter.');
      return;
    }

    if (currentWord === target) {
      setScore((prev) => prev + 10);
      setMessage('Perfect! You connected the word.');
      setTimeout(() => {
        const next = getRandomWord(target);
        setTarget(next.toUpperCase());
        setSelected([]);
        setMessage('New word ready. Keep going!');
      }, 900);
      return;
    }

    setMessage('Not quite. Try again.');
    setSelected([]);
  };

  const handleNext = () => {
    const next = getRandomWord(target);
    setTarget(next.toUpperCase());
    setSelected([]);
    setMessage('New word ready. Build it from the tiles.');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Word Connect</h2>
          <p className={styles.subtitle}>Link letter tiles to form the secret word.</p>
        </div>
        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>Score</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.message}>{message}</div>

        <div className={styles.selectedArea}>
          {selected.length > 0 ? (
            selected.map((item, index) => (
              <span key={`${item.index}-${index}`} className={styles.selectedTile}>
                {item.letter}
              </span>
            ))
          ) : (
            <div className={styles.placeholder}>Tap tiles to build the word</div>
          )}
        </div>

        <div className={styles.tileGrid}>
          {letters.map((letter, index) => (
            <button
              key={index}
              type="button"
              className={styles.tile}
              onClick={() => handleTileClick(letter, index)}
              disabled={selected.some((item) => item.index === index)}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.button} onClick={handleSubmit}>
            Submit
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleRemove}>
            Remove Last
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleNext}>
            New Word
          </button>
        </div>
      </div>
    </div>
  );
}
