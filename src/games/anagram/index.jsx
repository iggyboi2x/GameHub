import { useMemo, useState } from 'react';
import styles from './Anagram.module.css';

const WORDS = ['earth', 'evil', 'form', 'note', 'part', 'post', 'rate', 'rise'];

const ANAGRAMS = {
  'earth': 'heart',
  'evil': 'live',
  'form': 'from',
  'note': 'tone',
  'part': 'trap',
  'post': 'stop',
  'rate': 'tear',
  'rise': 'sire',
};

function shuffleWord(word) {
  const letters = [...word];
  let shuffled = word;

  while (shuffled === word) {
    for (let i = letters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    shuffled = letters.join('');
  }

  return shuffled;
}

function getRandomWord(exclude) {
  const options = WORDS.filter((word) => word !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function isCorrectGuess(guess, target) {
  return guess.trim().toLowerCase() === target.toLowerCase();
}

export default function AnagramGame() {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [scrambled, setScrambled] = useState(() => shuffleWord(word));
  const [target, setTarget] = useState(() => ANAGRAMS[word]);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);

  const hint = useMemo(() => `${target[0].toUpperCase()}${'.'.repeat(target.length - 2)}${target[target.length - 1].toUpperCase()}`, [target]);

  const nextWord = () => {
    const next = getRandomWord(word);
    setWord(next);
    setScrambled(shuffleWord(next));
    setTarget(ANAGRAMS[next]);
    setGuess('');
    setFeedback('');
    setShowAnswer(false);
    setRound((current) => current + 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!guess.trim()) {
      setFeedback('Enter a guess first.');
      return;
    }

    if (isCorrectGuess(guess, target)) {
      setScore((current) => current + 10);
      setFeedback('Correct! You found the anagram.');
    } else {
      setFeedback('Not quite — try again or reveal the answer.');
    }
  };

  const handleReveal = () => {
    setShowAnswer(true);
    setFeedback(`Answer: ${target}`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Anagram</h2>
          <p className={styles.subtitle}>Find the anagram word from the scrambled letters.</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Round</span>
            <strong>{round}</strong>
          </div>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.scrambled}>{scrambled}</div>
        <div className={styles.instructions}>
          <p>Type the anagram word and press Submit.</p>
          <p>Hint: <strong>{hint}</strong></p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="anagram-guess" className={styles.label}>Your guess</label>
          <input
            id="anagram-guess"
            className={styles.input}
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Type the word here"
            autoComplete="off"
          />
          <div className={styles.actions}>
            <button type="submit" className={styles.button}>Submit</button>
            <button type="button" className={styles.secondaryButton} onClick={nextWord}>Next word</button>
          </div>
        </form>

        <div className={styles.feedback}>
          {feedback || 'Good luck!'}
        </div>
        <button type="button" className={styles.linkButton} onClick={handleReveal}>
          Reveal answer
        </button>
        {showAnswer && <div className={styles.answer}>Answer: {target}</div>}
      </div>
    </div>
  );
}
