import { useMemo, useState } from 'react';
import styles from './Sudoku.module.css';

const START_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function buildInitialAnswers() {
  return START_GRID.map((row) => row.map((cell) => (cell === 0 ? '' : String(cell))));
}

export default function SudokuGame() {
  const [answers, setAnswers] = useState(buildInitialAnswers);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('Fill in the missing numbers to complete the board.');

  const fixedCells = useMemo(
    () => START_GRID.map((row) => row.map((cell) => cell !== 0)),
    [],
  );

  const handleChange = (rowIndex, colIndex, value) => {
    if (!/^[1-9]?$/.test(value)) return;
    setAnswers((prev) => prev.map((row, r) => (
      row.map((cell, c) => (r === rowIndex && c === colIndex ? value : cell))
    )));
  };

  const checkSolution = () => {
    const allFilled = answers.every((row) => row.every((cell) => cell !== ''));
    if (!allFilled) {
      setMessage('Complete every cell before checking.');
      return;
    }

    const solved = answers.every((row, r) => row.every((cell, c) => Number(cell) === SOLUTION[r][c]));
    if (solved) {
      setMessage('Perfect! The board is complete.');
      setCompleted(true);
    } else {
      setMessage('There are mistakes. Keep looking for the right numbers.');
      setCompleted(false);
    }
  };

  const revealSolution = () => {
    setAnswers(SOLUTION.map((row) => row.map((cell) => String(cell))));
    setCompleted(true);
    setMessage('Solution revealed. Use it to learn the pattern.');
  };

  const resetGame = () => {
    setAnswers(buildInitialAnswers());
    setCompleted(false);
    setMessage('Fill in the missing numbers to complete the board.');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Sudoku</h2>
          <p className={styles.subtitle}>Classic 9×9 number grid puzzle.</p>
        </div>
        <div className={styles.statusCard}>
          <span>{completed ? 'Completed' : 'In progress'}</span>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.message}>{message}</div>
        <div className={styles.grid}>
          {answers.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => {
                const isFixed = fixedCells[rowIndex][colIndex];
                const isCorrect = cell === String(SOLUTION[rowIndex][colIndex]);
                return (
                  <input
                    key={colIndex}
                    type="text"
                    maxLength="1"
                    value={cell}
                    readOnly={isFixed || completed}
                    disabled={isFixed}
                    className={`${styles.cell} ${completed && isCorrect ? styles.correct : ''}`}
                    onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.button} onClick={checkSolution}>
            Check Answers
          </button>
          <button type="button" className={styles.secondaryButton} onClick={revealSolution}>
            Reveal Solution
          </button>
          <button type="button" className={styles.secondaryButton} onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
