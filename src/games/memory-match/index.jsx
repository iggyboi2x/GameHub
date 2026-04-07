import { useEffect, useMemo, useState } from 'react';
import styles from './MemoryMatch.module.css';

const SYMBOLS = ['🐶', '🐱', '🦊', '🐰', '🦁', '🐼', '🐨', '🐸'];

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createDeck() {
  return shuffleArray(
    SYMBOLS.concat(SYMBOLS).map((symbol, index) => ({
      id: index,
      symbol,
      revealed: false,
      matched: false,
    })),
  );
}

export default function MemoryMatchGame() {
  const [cards, setCards] = useState(createDeck);
  const [activeIds, setActiveIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    if (activeIds.length < 2) return;

    const [firstId, secondId] = activeIds;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);

    if (firstCard && secondCard) {
      if (firstCard.symbol === secondCard.symbol) {
        setCards((prev) => prev.map((card) => (
          card.id === firstId || card.id === secondId
            ? { ...card, matched: true }
            : card
        )));
        setMatchedCount((prev) => prev + 2);
      }

      const timeout = window.setTimeout(() => {
        setCards((prev) => prev.map((card) => (
          card.id === firstId || card.id === secondId
            ? { ...card, revealed: card.matched || false }
            : card
        )));
        setActiveIds([]);
      }, 700);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [activeIds, cards]);

  const handleCardClick = (clickedId) => {
    const clickedCard = cards.find((card) => card.id === clickedId);
    if (!clickedCard || clickedCard.revealed || clickedCard.matched || activeIds.length === 2) {
      return;
    }

    setCards((prev) => prev.map((card) => (
      card.id === clickedId ? { ...card, revealed: true } : card
    )));
    setActiveIds((prev) => [...prev, clickedId]);
    setMoves((prev) => prev + 1);
  };

  const resetGame = () => {
    setCards(createDeck());
    setActiveIds([]);
    setMoves(0);
    setMatchedCount(0);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Memory Match</h2>
          <p className={styles.subtitle}>Flip cards and find the matching pairs.</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Moves</span>
            <strong>{moves}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Found</span>
            <strong>{matchedCount}/16</strong>
          </div>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.grid}>
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`${styles.card} ${card.revealed || card.matched ? styles.revealed : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <span>{card.revealed || card.matched ? card.symbol : '❓'}</span>
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.button} onClick={resetGame}>
            Restart
          </button>
        </div>

        {matchedCount === 16 && <div className={styles.message}>Great job! You matched every pair.</div>}
      </div>
    </div>
  );
}
