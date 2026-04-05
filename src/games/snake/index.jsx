import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Snake.module.css';

const GRID_SIZE = 16;
const SPEED_LEVELS = {
  slow: { label: 'Slow', interval: 150 },
  normal: { label: 'Normal', interval: 100 },
  fast: { label: 'Fast', interval: 70 },
  expert: { label: 'Expert', interval: 40 },
};
const DEFAULT_SPEED = 'normal';
const KEY_MAP = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const initialSnake = [
  { x: 8, y: 8 },
  { x: 8, y: 9 },
  { x: 8, y: 10 },
];

function getRandomFood(snake) {
  const occupied = new Set(snake.map((segment) => `${segment.x}-${segment.y}`));
  const freeCells = [];

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const key = `${x}-${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 0, y: 0 };
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(() => getRandomFood(initialSnake));
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);

  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const resetGame = () => {
    const initial = [...initialSnake];
    setSnake(initial);
    setFood(getRandomFood(initial));
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setPlaying(false);
    setStarted(false);
    setGameOver(false);
  };

  const startGame = () => {
    const initial = [...initialSnake];
    setSnake(initial);
    setFood(getRandomFood(initial));
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setStarted(true);
    setGameOver(false);
    setPlaying(true);
  };

  const moveSnake = () => {
    if (!playingRef.current) {
      return;
    }

    const currentDirection = directionRef.current;
    const head = snakeRef.current[0];
    const nextHead = {
      x: head.x + currentDirection.x,
      y: head.y + currentDirection.y,
    };

    const hitWall =
      nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
    const collided = snakeRef.current.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
    );

    if (hitWall || collided) {
      setPlaying(false);
      setGameOver(true);
      return;
    }

    const currentFood = foodRef.current;
    const ateFood = nextHead.x === currentFood.x && nextHead.y === currentFood.y;
    const nextSnake = [nextHead, ...snakeRef.current];

    if (!ateFood) {
      nextSnake.pop();
    }

    setSnake(nextSnake);

    if (ateFood) {
      setScore((current) => current + 1);
      setFood(getRandomFood(nextSnake));
    }
  };

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const currentSpeed = speedRef.current;
    const interval = SPEED_LEVELS[currentSpeed].interval;
    const gameInterval = window.setInterval(moveSnake, interval);
    return () => window.clearInterval(gameInterval);
  }, [speed, playing]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const nextDirection = KEY_MAP[event.key];
      if (!nextDirection) {
        return;
      }
      event.preventDefault();
      const current = directionRef.current;
      if (current.x + nextDirection.x === 0 && current.y + nextDirection.y === 0) {
        return;
      }
      setDirection(nextDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cells = useMemo(() => {
    const grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => 'empty');
    snake.forEach((segment, index) => {
      grid[segment.y * GRID_SIZE + segment.x] = index === 0 ? 'head' : 'body';
    });
    grid[food.y * GRID_SIZE + food.x] = 'food';
    return grid;
  }, [snake, food]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Snake</h2>
          <p className={styles.subtitle}>Eat the food, grow longer, and avoid the walls.</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.speedSelector}>
            <label htmlFor="speed-select" className={styles.speedLabel}>Speed:</label>
            <select
              id="speed-select"
              className={styles.speedSelect}
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              disabled={!playing}
            >
              {Object.entries(SPEED_LEVELS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.button}
            onClick={startGame}
            disabled={playing}
          >
            {gameOver ? 'Play Again' : 'Start'}
          </button>
          <button type="button" className={styles.button} onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>

      <div className={styles.board}>
        {cells.map((type, index) => (
          <div key={index} className={`${styles.cell} ${styles[type]}`}></div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          {started
            ? 'Use arrow keys to change direction. Don’t hit the wall or your tail.'
            : 'Select your speed, then press Start to begin.'}
        </p>
        {gameOver && <div className={styles.gameOver}>Game over — press Play Again or Reset.</div>}
      </div>
    </div>
  );
}
