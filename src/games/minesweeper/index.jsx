import { useEffect, useMemo, useState } from 'react';
import styles from './Minesweeper.module.css';

const GRID_SIZE = 8;
const MINE_COUNT = 10;

function createBoard() {
  const cells = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      hasMine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );

  let placed = 0;
  while (placed < MINE_COUNT) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (!cells[y][x].hasMine) {
      cells[y][x].hasMine = true;
      placed += 1;
    }
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (cells[row][col].hasMine) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const ny = row + dy;
          const nx = col + dx;
          if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
            if (cells[ny][nx].hasMine) count += 1;
          }
        }
      }
      cells[row][col].adjacent = count;
    }
  }

  return cells;
}

function revealEmpty(cells, row, col) {
  const stack = [[row, col]];
  const updated = cells.map((r) => r.map((cell) => ({ ...cell })));

  while (stack.length > 0) {
    const [y, x] = stack.pop();
    const cell = updated[y][x];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.adjacent === 0 && !cell.hasMine) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
            if (!updated[ny][nx].revealed) {
              stack.push([ny, nx]);
            }
          }
        }
      }
    }
  }

  return updated;
}

export default function MinesweeperGame() {
  const [board, setBoard] = useState(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('Find all safe cells without triggering a mine.');

  const revealedCount = useMemo(
    () => board.flat().filter((cell) => cell.revealed).length,
    [board],
  );

  const handleReveal = (row, col) => {
    if (gameOver || board[row][col].flagged) return;
    const target = board[row][col];
    if (target.hasMine) {
      setBoard((prev) => prev.map((r) => r.map((cell) => ({
        ...cell,
        revealed: cell.revealed || cell.hasMine,
      }))));
      setGameOver(true);
      setStatus('Boom! You hit a mine. Try again.');
      return;
    }

    setBoard(revealEmpty(board, row, col));
    setStatus('Keep going. Clear the board safely.');
  };

  const toggleFlag = (event, row, col) => {
    event.preventDefault();
    if (gameOver || board[row][col].revealed) return;
    setBoard((prev) => prev.map((r, y) => r.map((cell, x) => (
      y === row && x === col ? { ...cell, flagged: !cell.flagged } : cell
    ))));
  };

  const restart = () => {
    setBoard(createBoard());
    setGameOver(false);
    setStatus('Find all safe cells without triggering a mine.');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Minesweeper</h2>
          <p className={styles.subtitle}>Navigate the minefield carefully.</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Revealed</span>
            <strong>{revealedCount}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Mines</span>
            <strong>{MINE_COUNT}</strong>
          </div>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.message}>{status}</div>

        <div className={styles.grid}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => {
                const cellClass = cell.revealed
                  ? cell.hasMine
                    ? styles.mine
                    : styles.safe
                  : styles.covered;
                return (
                  <button
                    key={colIndex}
                    type="button"
                    className={`${styles.cell} ${cellClass}`}
                    onClick={() => handleReveal(rowIndex, colIndex)}
                    onContextMenu={(event) => toggleFlag(event, rowIndex, colIndex)}
                  >
                    {cell.revealed
                      ? cell.hasMine
                        ? '💣'
                        : cell.adjacent || ''
                      : cell.flagged
                        ? '🚩'
                        : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.button} onClick={restart}>
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
