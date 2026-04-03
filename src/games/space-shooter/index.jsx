import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SpaceShooter.module.css';

const GRID_WIDTH = 16;
const GRID_HEIGHT = 14;
const MAX_ENEMIES = 7;
const BASE_ENEMY_RATE = 800;
const TICK_INTERVAL = 70;

function getInitialPlayer() {
  return { x: Math.floor(GRID_WIDTH / 2), y: GRID_HEIGHT - 2 };
}

function createEnemy(id, level = 1) {
  const direction = Math.random() < 0.5 ? -1 : 1;
  let kind = 'grunt';
  let hp = 1;
  let shootChance = 0.01;

  if (level >= 8) {
    kind = 'bomber';
    hp = 3;
    shootChance = 0.08;
  } else if (level >= 4) {
    kind = 'shooter';
    hp = 2;
    shootChance = 0.05;
  }

  return {
    id,
    x: Math.floor(Math.random() * GRID_WIDTH),
    y: 0,
    alive: true,
    direction,
    speed: Math.max(1, 3 - Math.floor(level / 3)),
    kind,
    hp,
    shootChance,
  };
}

let audioCtx = null;
let isAudioMuted = false;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration = 0.08, type = 'square') {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.2;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);

  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
}

function playShootSound() {
  playTone(980, 0.05, 'triangle');
}

function playExplosionSound() {
  playTone(280, 0.16, 'sawtooth');
  setTimeout(() => playTone(220, 0.1, 'square'), 40);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function SpaceShooterGame() {
  const [player, setPlayer] = useState(getInitialPlayer());
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([createEnemy(1), createEnemy(2), createEnemy(3)]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [particles, setParticles] = useState([]);
  const [hitCells, setHitCells] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [muted, setMuted] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');

  const nextEnemyId = useRef(4);
  const frame = useRef(0);
  const bulletCooldown = useRef(0);

  const resetGame = () => {
    setPlayer(getInitialPlayer());
    setBullets([]);
    setEnemies([createEnemy(1), createEnemy(2), createEnemy(3, 1)]);
    setEnemyBullets([]);
    setParticles([]);
    setHitCells([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlaying(true);
    setGameOverMessage('');
    nextEnemyId.current = 4;
    frame.current = 0;
    bulletCooldown.current = 0;
  };

  const bulletsRef = useRef(bullets);
  const enemiesRef = useRef(enemies);
  const enemyBulletsRef = useRef(enemyBullets);
  const particlesRef = useRef(particles);
  const hitCellsRef = useRef(hitCells);

  useEffect(() => { bulletsRef.current = bullets; }, [bullets]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { enemyBulletsRef.current = enemyBullets; }, [enemyBullets]);
  useEffect(() => { particlesRef.current = particles; }, [particles]);
  useEffect(() => { hitCellsRef.current = hitCells; }, [hitCells]);
  useEffect(() => { isAudioMuted = muted; }, [muted]);

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
      if (event.key === 'r' || event.key === 'R') {
        resetGame();
      }

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        if (bulletCooldown.current <= 0) {
          setBullets((prev) => [...prev, { id: Date.now(), x: player.x, y: player.y - 1 }]);
          bulletCooldown.current = 7;
          playShootSound();
        }
      }

      if (event.key === 'Escape') {
        setShowGuide((prev) => !prev);
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [playing, player.x, player.y]);

  useEffect(() => {
    if (!playing) {
      return () => undefined;
    }

    const interval = window.setInterval(() => {
      frame.current += 1;
      if (bulletCooldown.current > 0) {
        bulletCooldown.current -= 1;
      }

      const currentLevel = level;
      const enemyDropRate = Math.max(8, 24 - currentLevel * 2);
      const isEnemyDropFrame = frame.current % enemyDropRate === 0;

      // move bullets
      const nextBullets = bulletsRef.current
        .map((bullet) => ({ ...bullet, y: bullet.y - 1 }))
        .filter((b) => b.y >= 0);

      // move enemy bullets
      const nextEnemyBullets = enemyBulletsRef.current
        .map((bullet) => ({ ...bullet, y: bullet.y + 1 }))
        .filter((b) => b.y < GRID_HEIGHT);

      // move enemies with sideways bounce
      let nextEnemies = enemiesRef.current
        .filter((enemy) => enemy.alive)
        .map((enemy) => {
          let newX = enemy.x + enemy.direction;
          let direction = enemy.direction;
          if (newX < 0 || newX >= GRID_WIDTH) {
            direction = -direction;
            newX = clamp(enemy.x + direction, 0, GRID_WIDTH - 1);
          }

          const newY = enemy.y + (isEnemyDropFrame ? 1 : 0);
          return { ...enemy, x: newX, y: newY, direction };
        });

      let scoreGain = 0;
      let lostLive = 0;
      const explosionSpawn = [];
      const hitSpawn = [];

      // bullet <-> enemy collision and enemy reach bottom
      const enemyHitMap = new Map();
      nextBullets.forEach((b) => enemyHitMap.set(`${b.x}:${b.y}`, b));

      nextEnemies = nextEnemies.reduce((acc, enemy) => {
        const enemyKey = `${enemy.x}:${enemy.y}`;
        if (enemyHitMap.has(enemyKey)) {
          const nextHp = enemy.hp - 1;
          hitSpawn.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y, life: 6 });
          if (nextHp <= 0) {
            const killValue = enemy.kind === 'bomber' ? 30 : enemy.kind === 'shooter' ? 18 : 10;
            scoreGain += killValue;
            playExplosionSound();
            explosionSpawn.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y, life: 12 });
          } else {
            acc.push({ ...enemy, hp: nextHp });
          }
          return acc;
        }

        if (enemy.y >= GRID_HEIGHT - 1) {
          lostLive += 1;
          explosionSpawn.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y, life: 14 });
          return acc;
        }

        acc.push(enemy);
        return acc;
      }, []);

      const reducedBullets = nextBullets.filter((bullet) => {
        const key = `${bullet.x}:${bullet.y}`;
        return !enemyHitMap.has(key);
      });

      // enemy bullets hit player
      const playerHit = nextEnemyBullets.filter((b) => b.x === player.x && b.y === player.y);
      if (playerHit.length > 0) {
        lostLive += playerHit.length;
        explosionSpawn.push({ id: Date.now() + Math.random(), x: player.x, y: player.y, life: 16 });
        hitSpawn.push({ id: Date.now() + Math.random(), x: player.x, y: player.y, life: 8 });
        playExplosionSound();
      }

      const enemyBulletsAfterHit = nextEnemyBullets.filter((b) => !(b.x === player.x && b.y === player.y));

      // enemies shoot randomly according to type
      const possibleShots = nextEnemies.flatMap((enemy) => {
        const chance = enemy.shootChance + currentLevel * 0.0015;
        if (Math.random() < chance) {
          const shots = [];
          if (enemy.kind === 'bomber') {
            shots.push({ id: Date.now() + Math.random(), x: enemy.x - 1, y: enemy.y + 1 });
            shots.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y + 1 });
            shots.push({ id: Date.now() + Math.random(), x: enemy.x + 1, y: enemy.y + 1 });
          } else {
            shots.push({ id: Date.now() + Math.random(), x: enemy.x, y: enemy.y + 1 });
          }
          playTone(650, 0.05, 'triangle');
          return shots.filter((shot) => shot.x >= 0 && shot.x < GRID_WIDTH && shot.y < GRID_HEIGHT);
        }
        return [];
      });

      nextEnemies = [...nextEnemies];
      const missing = Math.max(0, MAX_ENEMIES - nextEnemies.length);
      for (let i = 0; i < missing; i += 1) {
        nextEnemies.push(createEnemy(nextEnemyId.current++, currentLevel));
      }

      const nextParticles = particlesRef.current
        .map((p) => ({
          ...p,
          life: p.life - 1,
          x: p.x + (Math.random() - 0.5) * 0.3,
          y: p.y + (Math.random() - 0.5) * 0.3,
        }))
        .filter((p) => p.life > 0)
        .concat(explosionSpawn);

      const nextHitCells = hitCellsRef.current
        .map((p) => ({ ...p, life: p.life - 1 }))
        .filter((p) => p.life > 0)
        .concat(hitSpawn);

      setEnemies(nextEnemies);
      setBullets(reducedBullets);
      setEnemyBullets([...enemyBulletsAfterHit, ...possibleShots]);
      setParticles(nextParticles);
      setHitCells(nextHitCells);

      if (scoreGain > 0) {
        setScore((prevScore) => {
          const nextScore = prevScore + scoreGain;
          const nextLevel = Math.floor(nextScore / 120) + 1;
          if (nextLevel > level) {
            setLevel(nextLevel);
            setGameOverMessage(`Level up to ${nextLevel}!`);
            window.setTimeout(() => { setGameOverMessage(''); }, 1200);
          }
          return nextScore;
        });
      }

      if (lostLive > 0) {
        setLives((prev) => {
          const remaining = Math.max(0, prev - lostLive);
          if (remaining <= 0) {
            setPlaying(false);
            setGameOverMessage('No lives left. Try again!');
          }
          return remaining;
        });
      }

      // Really tough special event: spawn burst
      if (frame.current % 400 === 0) {
        setEnemies((prev) => [
          ...prev,
          createEnemy(nextEnemyId.current++, currentLevel),
          createEnemy(nextEnemyId.current++, currentLevel),
        ]);
      }

    }, TICK_INTERVAL);

    return () => window.clearInterval(interval);
  }, [playing, player.x, player.y, level]);

  const gridCells = useMemo(() => {
    const cells = Array.from({ length: GRID_WIDTH * GRID_HEIGHT }, () => ({ type: 'empty' }));
    const hitSet = new Set(hitCells.map((h) => `${h.x}:${h.y}`));

    enemies.forEach((enemy) => {
      if (enemy.alive && enemy.y >= 0 && enemy.y < GRID_HEIGHT) {
        const cellKey = `${enemy.x}:${enemy.y}`;
        cells[enemy.y * GRID_WIDTH + enemy.x] = {
          type: 'enemy',
          kind: enemy.kind,
          hp: enemy.hp,
          hit: hitSet.has(cellKey),
        };
      }
    });

    bullets.forEach((bullet) => {
      if (bullet.y >= 0 && bullet.y < GRID_HEIGHT) {
        cells[bullet.y * GRID_WIDTH + bullet.x] = { type: 'bullet' };
      }
    });

    enemyBullets.forEach((bullet) => {
      if (bullet.y >= 0 && bullet.y < GRID_HEIGHT) {
        cells[bullet.y * GRID_WIDTH + bullet.x] = { type: 'enemyBullet' };
      }
    });

    cells[player.y * GRID_WIDTH + player.x] = { type: 'player' };
    return cells;
  }, [player, bullets, enemies, enemyBullets, hitCells]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Space Shooter</h2>
          <p className={styles.subtitle}>Pilot your ship through waves, dodge lasers, and survive.</p>
        </div>

        <div className={styles.panel}>
          <button className={styles.helpButton} onClick={() => setShowGuide((prev) => !prev)} type="button">?</button>
          <button className={styles.toggleButton} onClick={() => setMuted((prev) => !prev)} type="button">
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Lives</span>
            <strong>{lives}</strong>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Level</span>
            <strong>{level}</strong>
          </div>
          <button type="button" className={styles.button} onClick={resetGame}>
            Restart
          </button>
        </div>
      </div>

      <div className={styles.board}>
        {gridCells.map((cell, index) => {
          const kindClass = cell.type === 'enemy' && cell.kind
            ? styles[`enemy${cell.kind.charAt(0).toUpperCase() + cell.kind.slice(1)}`]
            : '';
          const hitClass = cell.hit ? styles.hit : '';
          return (
            <div
              key={index}
              className={`${styles.cell} ${styles[cell.type]} ${kindClass} ${hitClass}`}
              title={cell.type === 'enemy' ? `${cell.kind.toUpperCase()} HP ${cell.hp}` : ''}
            />
          );
        })}

        {particles.map((particle) => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `calc((100% / ${GRID_WIDTH}) * ${particle.x + 0.5})`,
              top: `calc((100% / ${GRID_HEIGHT}) * ${particle.y + 0.5})`,
              opacity: Math.min(1, Math.max(0, particle.life / 12)),
            }}
          />
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          Controls: Left/Right arrows = move, Space = shoot, R = restart, Esc = guide.
          Avoid enemy bullets and enemies reaching the bottom.
        </p>
        {gameOverMessage && <div className={styles.status}>{gameOverMessage}</div>}
        {!playing && <div className={styles.gameOver}>Game over — press Restart to try again</div>}
      </div>

      {showGuide && (
        <div className={styles.guideOverlay}>
          <div className={styles.guideCard}>
            <h3>Game Guide</h3>
            <ul>
              <li>Move left/right to dodge incoming enemy lasers.</li>
              <li>Press Space to fire. Manage cooldown.</li>
              <li>Each enemy destroyed = +10 points.</li>
              <li>Enemies reaching the bottom penalize lives.</li>
              <li>Survive to raise level and increase enemy attack frequency.</li>
            </ul>
            <p>Press <strong>Esc</strong> or <strong>?</strong> to close guide.</p>
          </div>
        </div>
      )}
    </div>
  );
}

