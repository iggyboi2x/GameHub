import { useState, useEffect, useCallback } from 'react';
import { WORDS } from './wordlist';
import styles from './Wordle.module.css';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function getTodaysWord() {
  const start = new Date('2024-01-01');
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return WORDS[diff % WORDS.length].toUpperCase();
}

function evaluateGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  const targetCount = {};

  targetArr.forEach((l) => { targetCount[l] = (targetCount[l] || 0) + 1; });

  guessArr.forEach((letter, i) => {
    if (letter === targetArr[i]) {
      result[i] = 'correct';
      targetCount[letter]--;
    }
  });

  guessArr.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    if (targetCount[letter] > 0) {
      result[i] = 'present';
      targetCount[letter]--;
    }
  });

  return result;
}

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

export default function WordleGame() {
  const [target] = useState(getTodaysWord);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [revealed, setRevealed] = useState([]);

  const letterStates = {};
  guesses.forEach(({ word, result }) => {
    word.split('').forEach((letter, i) => {
      const prev = letterStates[letter];
      const next = result[i];
      if (prev === 'correct') return;
      if (prev === 'present' && next !== 'correct') return;
      letterStates[letter] = next;
    });
  });

  const showMessage = (msg, duration = 1800) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMessage('Not enough letters');
      return;
    }
    if (!WORDS.includes(current.toLowerCase())) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMessage('Not in word list');
      return;
    }

    const result = evaluateGuess(current, target);
    const newGuess = { word: current, result };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setCurrent('');

    const rowIndex = newGuesses.length - 1;
    result.forEach((_, i) => {
      setTimeout(() => {
        setRevealed((prev) => [...prev, `${rowIndex}-${i}`]);
      }, i * 120);
    });

    const isWon = result.every((r) => r === 'correct');
    const delay = WORD_LENGTH * 120 + 200;

    setTimeout(() => {
      if (isWon) {
        setWon(true);
        setGameOver(true);
        const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
        showMessage(msgs[newGuesses.length - 1] || 'Nice!', 3000);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
        showMessage(target, 4000);
      }
    }, delay);
  }, [current, guesses, target]);

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === '⌫' || key === 'BACKSPACE') {
      setCurrent((prev) => prev.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
      setCurrent((prev) => prev + key);
    }
  }, [gameOver, current, submitGuess]);

  useEffect(() => {
    const handler = (e) => handleKey(e.key.toUpperCase());
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const resetGame = () => {
    setGuesses([]);
    setCurrent('');
    setGameOver(false);
    setWon(false);
    setRevealed([]);
    setMessage('');
  };

  const allRows = [
    ...guesses,
    ...(guesses.length < MAX_GUESSES && !gameOver
      ? [{ word: current, result: null }]
      : []),
    ...Array(Math.max(0, MAX_GUESSES - guesses.length - (gameOver ? 0 : 1))).fill({ word: '', result: null }),
  ].slice(0, MAX_GUESSES);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Wordle</h2>
          <p className={styles.subtitle}>Guess the word in {MAX_GUESSES} tries</p>
        </div>
        <button className={styles.button} onClick={resetGame}>Restart</button>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.board}>
        {allRows.map((row, rowIndex) => {
          const isActive = rowIndex === guesses.length && !gameOver;
          const letters = row.word.padEnd(WORD_LENGTH, ' ').split('');
          return (
            <div key={rowIndex} className={`${styles.row} ${isActive && shake ? styles.shake : ''}`}>
              {letters.map((letter, colIndex) => {
                const isRevealed = revealed.includes(`${rowIndex}-${colIndex}`);
                const state = row.result ? row.result[colIndex] : '';
                const filled = letter.trim() !== '';
                return (
                  <div
                    key={colIndex}
                    className={`
                      ${styles.tile}
                      ${filled && !row.result ? styles.filled : ''}
                      ${isRevealed && state ? styles[state] : ''}
                      ${isRevealed ? styles.flip : ''}
                    `}
                    style={{ animationDelay: `${colIndex * 120}ms` }}
                  >
                    {letter.trim()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className={styles.keyRow}>
            {row.map((key) => (
              <button
                key={key}
                className={`${styles.key} ${key.length > 1 ? styles.keyWide : ''} ${letterStates[key] ? styles[letterStates[key]] : ''}`}
                onClick={() => handleKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className={styles.footer}>
          {won
            ? <p className={styles.winText}>You got it in {guesses.length}/6!</p>
            : <p className={styles.loseText}>The word was <strong>{target}</strong></p>
          }
          <button className={styles.button} onClick={resetGame}>Play again</button>
        </div>
      )}
    </div>
  );
}
