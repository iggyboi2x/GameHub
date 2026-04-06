import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Tetris.module.css';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const SPEED_LEVELS = {
  slow: { label: 'Slow', interval: 650 },
  normal: { label: 'Normal', interval: 420 },
  fast: { label: 'Fast', interval: 240 },
};

const TETROMINOS = {
  I: {
    color: '#45E0FF',
    rotations: [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
    ],
  },
  O: {
    color: '#FFE15A',
    rotations: [
      [[1, 0], [2, 0], [1, 1], [2, 1]],
    ],
  },
  T: {
    color: '#9D6BFF',
    rotations: [
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [1, 2]],
      [[1, 0], [0, 1], [1, 1], [1, 2]],
    ],
  },
  L: {
    color: '#FF9D3B',
    rotations: [
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [1, 2], [0, 2]],
    ],
  },
  J: {
    color: '#4BAFFF',
    rotations: [
      [[2, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 1], [0, 2]],
      [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
  },
  S: {
    color: '#2FE06C',
    rotations: [
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]],
    ],
  },
  Z: {
    color: '#FF4B7A',
    rotations: [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [1, 1], [2, 1], [1, 2]],
    ],
  },
};

const PIECE_TYPES = Object.keys(TETROMINOS);
const START_POSITION = { x: 3, y: -1 };

function createEmptyBoard() {
  return Array.from({ length: GRID_HEIGHT }, () => Array.from({ length: GRID_WIDTH }, () => 0));
}

function getRandomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return { type, rotation: 0 };
}

function getPieceCells(piece, position) {
  const pattern = TETROMINOS[piece.type].rotations[piece.rotation];
  return pattern.map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy, color: TETROMINOS[piece.type].color }));
}

function isValidPosition(cells, board) {
  return cells.every(({ x, y }) => {
    if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) {
      return false;
    }
    if (y < 0) {
      return true;
    }
    return board[y][x] === 0;
  });
}

function mergePiece(board, cells) {
  return board.map((row, y) =>
    row.map((cell, x) => {
      const pieceCell = cells.find((pos) => pos.x === x && pos.y === y);
      return pieceCell ? pieceCell.color : cell;
    }),
  );
}

function clearFinishedRows(board) {
  const rows = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = GRID_HEIGHT - rows.length;
  const freshRows = Array.from({ length: cleared }, () => Array.from({ length: GRID_WIDTH }, () => 0));
  return { board: [...freshRows, ...rows], cleared };
}

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [position, setPosition] = useState(START_POSITION);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState('normal');

  const boardRef = useRef(board);
  const pieceRef = useRef(currentPiece);
  const positionRef = useRef(position);
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    pieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const spawnNewPiece = (next) => {
    const nextBoard = boardRef.current;
    const spawn = START_POSITION;
    const initialCells = getPieceCells(next, spawn);
    if (!isValidPosition(initialCells, nextBoard)) {
      setPlaying(false);
      setGameOver(true);
      return false;
    }
    setCurrentPiece(next);
    setPosition(spawn);
    setNextPiece(getRandomPiece());
    return true;
  };

  const lockPiece = () => {
    const cells = getPieceCells(pieceRef.current, positionRef.current);
    const merged = mergePiece(boardRef.current, cells);
    const { board: clearedBoard, cleared } = clearFinishedRows(merged);
    setBoard(clearedBoard);

    if (cleared > 0) {
      setScore((current) => current + cleared * 150);
      setLines((current) => current + cleared);
    }

    const next = nextPiece;
    if (!spawnNewPiece(next)) {
      return;
    }
  };

  const stepDown = () => {
    if (!playingRef.current || gameOverRef.current) {
      return;
    }

    const nextPos = { x: positionRef.current.x, y: positionRef.current.y + 1 };
    const cells = getPieceCells(pieceRef.current, nextPos);

    if (isValidPosition(cells, boardRef.current)) {
      setPosition(nextPos);
      return;
    }

    if (positionRef.current.y < 0) {
      setPlaying(false);
      setGameOver(true);
      return;
    }

    lockPiece();
  };

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    const interval = SPEED_LEVELS[speedRef.current].interval;
    const timer = window.setInterval(stepDown, interval);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const handleKeyDown = (event) => {
    if (!playing || gameOver) {
      return;
    }

    const { key } = event;
    const actions = {
      ArrowLeft: () => movePiece(-1, 0),
      ArrowRight: () => movePiece(1, 0),
      ArrowDown: () => stepDown(),
      ArrowUp: () => rotatePiece(1),
      ' ': () => rotatePiece(1),
    };

    if (actions[key]) {
      event.preventDefault();
      actions[key]();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, gameOver]);

  const movePiece = (dx, dy) => {
    const nextPos = { x: positionRef.current.x + dx, y: positionRef.current.y + dy };
    const nextCells = getPieceCells(pieceRef.current, nextPos);
    if (isValidPosition(nextCells, boardRef.current)) {
      setPosition(nextPos);
    }
  };

  const rotatePiece = (direction = 1) => {
    const nextRotation = (pieceRef.current.rotation + direction + TETROMINOS[pieceRef.current.type].rotations.length) % TETROMINOS[pieceRef.current.type].rotations.length;
    const rotatedPiece = { ...pieceRef.current, rotation: nextRotation };
    const cells = getPieceCells(rotatedPiece, positionRef.current);

    if (isValidPosition(cells, boardRef.current)) {
      setCurrentPiece(rotatedPiece);
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    const first = getRandomPiece();
    const second = getRandomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
    setPosition(START_POSITION);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setStarted(false);
    setPlaying(false);
  };

  const startGame = () => {
    setBoard(createEmptyBoard());
    const first = getRandomPiece();
    const second = getRandomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
    setPosition(START_POSITION);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setStarted(true);
    setPlaying(true);
  };

  const activeBoard = useMemo(() => {
    const ghost = board.map((row) => [...row]);
    const cells = getPieceCells(currentPiece, position);
    cells.forEach(({ x, y, color }) => {
      if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
        ghost[y][x] = color;
      }
    });
    return ghost;
  }, [board, currentPiece, position]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Tetris</h2>
          <p className={styles.subtitle}>Stack blocks, clear lines, and keep the board from filling.</p>
        </div>

        <div className={styles.panel}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Lines</span>
            <strong>{lines}</strong>
          </div>
          <div className={styles.speedSelector}>
            <label htmlFor="speed-select" className={styles.speedLabel}>Speed</label>
            <select
              id="speed-select"
              className={styles.speedSelect}
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
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
            disabled={playing && !gameOver}
          >
            {gameOver ? 'Play Again' : 'Start'}
          </button>
          <button type="button" className={styles.buttonSecondary} onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>

      <div className={styles.playArea}>
        <div className={styles.board}>
          {activeBoard.flat().map((cell, index) => (
            <div
              key={index}
              className={styles.cell}
              style={cell ? { backgroundColor: cell, boxShadow: `0 0 0 1px rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.15)` } : undefined}
            />
          ))}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.previewCard}>
            <span className={styles.previewLabel}>Next</span>
            <div className={styles.previewGrid}>
              {Array.from({ length: 16 }).map((_, index) => {
                const x = index % 4;
                const y = Math.floor(index / 4);
                const previewCells = getPieceCells(nextPiece, { x: x - 1, y: y - 1 });
                const cell = previewCells.find((pos) => pos.x === x && pos.y === y);
                return (
                  <div
                    key={index}
                    className={styles.previewCell}
                    style={cell ? { backgroundColor: cell.color } : undefined}
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.hudText}>
            <p>{started ? 'Use arrow keys to move and rotate.' : 'Choose a speed and press Start.'}</p>
            <p>Arrow Left / Right: move</p>
            <p>Arrow Up / Space: rotate</p>
            <p>Arrow Down: drop faster</p>
          </div>
        </div>
      </div>

      {gameOver && <div className={styles.gameOver}>Game over — press Play Again or Reset.</div>}
    </div>
  );
}
