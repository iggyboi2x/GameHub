import { useState, useMemo } from 'react';
import styles from './Crossword.module.css';
import { categories } from './words';

function generateGrid(clues, gridSize = 13) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  const cellNumbers = {};
  const clueMap = {};
  let numberCounter = 1;

  // Place "across" clues starting from top
  let currentRow = 1;
  clues
    .filter((c) => c.direction === 'across')
    .forEach((clue) => {
      if (currentRow >= gridSize - 1) return;
      const word = clue.word;
      const startCol = 1;

      // Assign number to first cell
      const cellKey = `${currentRow}:${startCol}`;
      cellNumbers[cellKey] = numberCounter;

      // Place word horizontally
      for (let i = 0; i < word.length; i += 1) {
        const col = startCol + i;
        if (col < gridSize) {
          grid[currentRow][col] = {
            letter: word[i],
            number: i === 0 ? numberCounter : undefined,
            answered: '',
          };
        }
      }

      clueMap[numberCounter] = { word, direction: 'across', clue: clue.clue };
      numberCounter += 1;
      currentRow += 2;
    });

  // Place "down" clues starting from top, shifted right
  let currentCol = 8;
  clues
    .filter((c) => c.direction === 'down')
    .forEach((clue) => {
      if (currentCol >= gridSize) return;
      const word = clue.word;
      const startRow = 1;

      // Check if we need to assign a number (if cell is empty)
      const cellKey = `${startRow}:${currentCol}`;
      let assignedNumber = cellNumbers[cellKey];
      if (!assignedNumber) {
        assignedNumber = numberCounter;
        cellNumbers[cellKey] = numberCounter;
        numberCounter += 1;
      }

      // Place word vertically
      for (let i = 0; i < word.length; i += 1) {
        const row = startRow + i;
        if (row < gridSize) {
          if (!grid[row][currentCol]) {
            grid[row][currentCol] = { letter: word[i], number: undefined, answered: '' };
          } else {
            grid[row][currentCol].letter = word[i];
          }

          if (i === 0) {
            grid[row][currentCol].number = assignedNumber;
          }
        }
      }

      clueMap[assignedNumber] = { word, direction: 'down', clue: clue.clue };
      currentCol += 3;
    });

  return { grid, clueMap, cellNumbers };
}

export default function CrosswordGame() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const gameData = useMemo(() => {
    if (!selectedCategory) return null;
    const clues = categories[selectedCategory].clues;
    return generateGrid(clues);
  }, [selectedCategory]);

  const handleCellChange = (row, col, value) => {
    const key = `${row}:${col}`;
    const newAnswers = { ...userAnswers, [key]: value.toUpperCase().slice(0, 1) };
    setUserAnswers(newAnswers);
  };

  const checkAnswers = () => {
    if (!gameData) return;
    let correct = 0;
    let total = Object.keys(gameData.clueMap).length;

    Object.entries(gameData.clueMap).forEach(([num, clueData]) => {
      const cellKey = Object.entries(gameData.cellNumbers).find(([, n]) => n === Number(num))?.[0];
      if (!cellKey) return;

      const [startRow, startCol] = cellKey.split(':').map(Number);
      let userWord = '';

      if (clueData.direction === 'across') {
        for (let i = 0; i < clueData.word.length; i += 1) {
          const key = `${startRow}:${startCol + i}`;
          userWord += userAnswers[key] || '';
        }
      } else {
        for (let i = 0; i < clueData.word.length; i += 1) {
          const key = `${startRow + i}:${startCol}`;
          userWord += userAnswers[key] || '';
        }
      }

      if (userWord === clueData.word) {
        correct += 1;
      }
    });

    const finalScore = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore(finalScore);
    setCompleted(true);
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setUserAnswers({});
    setCompleted(false);
    setScore(0);
  };

  if (!selectedCategory) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crossword Puzzle</h1>
          <p className={styles.subtitle}>Choose a category and solve the crossword puzzle!</p>
        </div>

        <div className={styles.categoryGrid}>
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              className={styles.categoryCard}
              onClick={() => setSelectedCategory(key)}
              type="button"
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!gameData) {
    return <div>Loading...</div>;
  }

  const category = categories[selectedCategory];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {category.icon} {category.name} Crossword
          </h1>
          <p className={styles.subtitle}>Fill in the blanks using the clues below.</p>
        </div>
        <button className={styles.backButton} onClick={resetGame} type="button">
          ← Back to Categories
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.gridSection}>
          <div className={styles.grid}>
            {gameData.grid.map((row, r) => (
              <div key={r} className={styles.gridRow}>
                {row.map((cell, c) => (
                  <div key={`${r}:${c}`} className={styles.gridCell}>
                    {cell ? (
                      <>
                        {cell.number && <div className={styles.cellNumber}>{cell.number}</div>}
                        <input
                          type="text"
                          maxLength="1"
                          value={userAnswers[`${r}:${c}`] || ''}
                          onChange={(e) => handleCellChange(r, c, e.target.value)}
                          disabled={completed}
                          className={
                            userAnswers[`${r}:${c}`] === cell.letter
                              ? styles.correct
                              : completed && userAnswers[`${r}:${c}`]
                                ? styles.incorrect
                                : ''
                          }
                        />
                      </>
                    ) : (
                      <div className={styles.blackCell} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {!completed && (
            <button className={styles.submitButton} onClick={checkAnswers} type="button">
              Check Answers
            </button>
          )}

          {completed && (
            <div className={styles.resultCard}>
              <h3>Score: {score}%</h3>
              <button className={styles.restartButton} onClick={resetGame} type="button">
                Play Another Category
              </button>
            </div>
          )}
        </div>

        <div className={styles.cluesSection}>
          <div className={styles.clueGroup}>
            <h3>Across</h3>
            <div className={styles.clueList}>
              {Object.entries(gameData.clueMap)
                .filter(([, data]) => data.direction === 'across')
                .sort(([numA], [numB]) => Number(numA) - Number(numB))
                .map(([num, data]) => (
                  <div key={num} className={styles.clueItem}>
                    <strong>{num}.</strong> {data.clue}
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.clueGroup}>
            <h3>Down</h3>
            <div className={styles.clueList}>
              {Object.entries(gameData.clueMap)
                .filter(([, data]) => data.direction === 'down')
                .sort(([numA], [numB]) => Number(numA) - Number(numB))
                .map(([num, data]) => (
                  <div key={num} className={styles.clueItem}>
                    <strong>{num}.</strong> {data.clue}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
