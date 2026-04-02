import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GameCard.module.css';

export default function GameCard({ game }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handlePlay = () => {
    if (game.available) {
      navigate(`/play/${game.slug}`);
    }
  };

  const rgb = hexToRgb(game.color);

  return (
    <div
      className={`${styles.card} ${hovered ? styles.hovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
      style={{ '--game-color': game.color, '--game-rgb': rgb }}
    >
      <div className={styles.topBar} />

      {game.hot && <span className={styles.hotBadge}>HOT</span>}
      {!game.available && <span className={styles.soonBadge}>SOON</span>}

      <div className={styles.icon}>{game.icon}</div>

      <div className={styles.title}>{game.title}</div>
      <div className={styles.desc}>{game.desc}</div>

      <div className={styles.footer}>
        <span className={styles.catTag}>{game.category}</span>
        <span className={styles.plays}>{game.plays} plays</span>
      </div>

      {game.available && (
        <div className={`${styles.playBtn} ${hovered ? styles.playVisible : ''}`}>
          PLAY NOW
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
