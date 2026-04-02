import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SpaceShooter.module.css';

const GRID_WIDTH = 16;
const GRID_HEIGHT = 12;
const INITIAL_BULLET_SPEED = 120;
const ENEMY_SPEED = 500;
const MAX_ENEMIES = 5;

function getInitialPlayer() {
  return { x: Math.floor(GRID_WIDTH / 2), y: GRID_HEIGHT - 2 };
}

function createEnemy(id) {
  return { id, x: Math.floor(Math.random() * GRID_WIDTH), y: 0, alive: true };
}

export default function SpaceShooterGame() {
  const [player, setPlayer] = useState(getInitialPlayer());
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([createEnemy(1), createEnemy(2), createEnemy(3)]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playing, setPlaying] = useState(true);
  const nextEnemyId = useRef(4);

  const resetGame = () => {
    setPlayer(getInitialPlayer());
    setBullets([]);
    setEnemies([createEnemy(1), createEnemy(2), createEnemy(3)]);
    setScore(0);
    setLives(3);
    setPlaying(true);
    nextEnemyId.current = 4;
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (!playing) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        setPlayer((prev) => ({ x: Math.max(0, prev.x - 1), y: prev.y }));
      }
      if (event.key === 'ArrowRight') {
        setPlayer((prev) => ({ x: Math.min(GRID_WIDTH - 1, prev.x + 1), y: prev.y }));
      }
      if (event.key === 'ArrowUp') {
        setPlayer((prev) => ({ x: prev.x, y: Math.max(0, prev.y - 1) }));
      }
      if (event.key === 'ArrowDown') {
        setPlayer((prev) => ({ x: prev.x, y: Math.min(GRID_HEIGHT - 1, prev.y + 1) }));
      }
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        setBullets((prev) => [...prev, { id: Date.now(), x: player.x, y: player.y - 1 }]);
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [playing, player.x, player.y]);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setBullets((prevBullets) => prevBullets
        .map((bullet) => ({ ...bullet, y: bullet.y - 1 }))
        .filter((bullet) => bullet.y >= 0));

      setEnemies((prevEnemies) => prevEnemies.map((enemy) => ({ ...enemy, y: enemy.y + 1 })));
    }, INITIAL_BULLET_SPEED);

    return () => window.clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const collisionCheck = () => {
      setEnemies((prevEnemies) => {
        let currentScore = 0;
        const bulletsToRemove = new Set();

        const nextEnemies = prevEnemies.map((enemy) => {
          if (!enemy.alive) {
            return enemy;
          }

          const hitBullet = bullets.find(
            (bullet) => bullet.x === enemy.x && bullet.y === enemy.y,
          );

          if (hitBullet) {
            bulletsToRemove.add(hitBullet.id);
            currentScore += 10;
            return { ...enemy, alive: false };
          }

          if (enemy.y >= GRID_HEIGHT - 1) {
            setLives((prevLives) => prevLives - 1);
            return { ...enemy, alive: false };
          }

          return enemy;
        });

        if (currentScore > 0) {
          setScore((prev) => prev + currentScore);
        }

        if (bulletsToRemove.size > 0) {
          setBullets((prevBullets) => prevBullets.filter((bullet) => !bulletsToRemove.has(bullet.id)));
        }

        return nextEnemies.filter((enemy) => enemy.alive);
      });
    };

    const interval = window.setInterval(collisionCheck, 100);
    return () => window.clearInterval(interval);
  }, [playing, bullets]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      setEnemies((prevEnemies) => {
        const nextEnemies = prevEnemies.slice();
        const currentCount = nextEnemies.filter((enemy) => enemy.alive).length;
        const missing = Math.max(0, MAX_ENEMIES - currentCount);

        for (let i = 0; i < missing; i += 1) {
          nextEnemies.push(createEnemy(nextEnemyId.current++));
        }

        return nextEnemies;
      });
    }, ENEMY_SPEED);

    return () => window.clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    if (lives <= 0) {
      setPlaying(false);
    }
  }, [lives]);

  const gridCells = useMemo(() => {
    const cells = Array.from({ length: GRID_WIDTH * GRID_HEIGHT }, () => ({ type: 'empty' }));

    enemies.forEach((enemy) => {
      if (enemy.alive && enemy.y >= 0 && enemy.y < GRID_HEIGHT) {
        cells[enemy.y * GRID_WIDTH + enemy.x] = { type: 'enemy' };
      }
    });

    bullets.forEach((bullet) => {
      if (bullet.y >= 0 && bullet.y < GRID_HEIGHT) {
        cells[bullet.y * GRID_WIDTH + bullet.x] = { type: 'bullet' };
      }
    });

    cells[player.y * GRID_WIDTH + player.x] = { type: 'player' };
    return cells;
  }, [player, bullets, enemies]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Space Shooter</h2>
          <p className={styles.subtitle}>Pilot your ship, shoot incoming enemies, and survive as long as possible.</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Lives</span>
            <strong>{lives}</strong>
          </div>
          <button type="button" className={styles.button} onClick={resetGame}>
            Restart
          </button>
        </div>
      </div>

      <div className={styles.board}>
        {gridCells.map((cell, index) => (
          <div key={index} className={`${styles.cell} ${styles[cell.type]}`} />
        ))}
      </div>

      <div className={styles.footer}>
        <p>Use arrow keys to move and spacebar to shoot. Keep enemies from reaching the bottom.</p>
        {!playing && <div className={styles.gameOver}>Game over — press restart to play again.</div>}
      </div>
    </div>
  );
}
