import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './2048.module.css';

const GRID_SIZE = 4;
const START_TILES = 2;
const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const createTile = (id, value, x, y, flags = {}) => ({
  id,
  value,
  x,
  y,
  isNew: flags.isNew ?? false,
  isMerged: flags.isMerged ?? false,
});

function getRandomPosition(occupied) {
  const emptyCells = [];
  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const key = `${x}-${y}`;
      if (!occupied.has(key)) {
        emptyCells.push({ x, y });
      }
    }
  }

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function createStartingTiles(nextId) {
  const occupied = new Set();
  const tiles = [];

  for (let i = 0; i < START_TILES; i += 1) {
    const { x, y } = getRandomPosition(occupied);
    occupied.add(`${x}-${y}`);
    tiles.push(createTile(nextId.current++, 2, x, y, { isNew: true }));
  }

  return tiles;
}

function getHighestTileValue(tiles) {
  return tiles.reduce((max, tile) => Math.max(max, tile.value), 0);
}

function getSpawnValue(highestValue) {
  if (highestValue <= 2) {
    return 2;
  }

  const maxPower = Math.log2(highestValue);
  const smallestPower = Math.max(1, maxPower - 5);
  const allowedValues = [];

  for (let power = smallestPower; power < maxPower; power += 1) {
    allowedValues.push(2 ** power);
  }

  if (allowedValues.length === 0) {
    return 2;
  }

  const weights = allowedValues.map((value) => (value === 2 ? 6 : value === 4 ? 3 : 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (let index = 0; index < allowedValues.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return allowedValues[index];
    }
  }

  return allowedValues[allowedValues.length - 1];
}

function getLineIndex(tile, direction) {
  return direction === 'left' || direction === 'right' ? tile.y : tile.x;
}

function getTilePosition(tile, direction) {
  return direction === 'left' || direction === 'right' ? tile.x : tile.y;
}

function getTargetCoordinate(lineIndex, targetIndex, direction) {
  if (direction === 'left') return { x: targetIndex, y: lineIndex };
  if (direction === 'right') return { x: GRID_SIZE - 1 - targetIndex, y: lineIndex };
  if (direction === 'up') return { x: lineIndex, y: targetIndex };
  return { x: lineIndex, y: GRID_SIZE - 1 - targetIndex };
}

function moveTiles(tiles, direction) {
  const lines = new Map();
  tiles.forEach((tile) => {
    const index = getLineIndex(tile, direction);
    if (!lines.has(index)) {
      lines.set(index, []);
    }
    lines.get(index).push(tile);
  });

  const movedTiles = [];
  let moved = false;
  let score = 0;

  for (let line = 0; line < GRID_SIZE; line += 1) {
    const lineTiles = (lines.get(line) ?? []).slice();
    const ascending = direction === 'left' || direction === 'up';
    lineTiles.sort((a, b) => ascending ? getTilePosition(a, direction) - getTilePosition(b, direction) : getTilePosition(b, direction) - getTilePosition(a, direction));

    let targetIndex = 0;
    for (let i = 0; i < lineTiles.length; i += 1) {
      const current = lineTiles[i];
      const next = lineTiles[i + 1];

      if (next && current.value === next.value) {
        const mergedValue = current.value * 2;
        const targetCoord = getTargetCoordinate(line, targetIndex, direction);
        movedTiles.push(createTile(current.id, mergedValue, targetCoord.x, targetCoord.y, { isMerged: true }));
        score += mergedValue;
        if (current.x !== targetCoord.x || current.y !== targetCoord.y || next.x !== targetCoord.x || next.y !== targetCoord.y) {
          moved = true;
        }
        i += 1;
        targetIndex += 1;
      } else {
        const targetCoord = getTargetCoordinate(line, targetIndex, direction);
        movedTiles.push(createTile(current.id, current.value, targetCoord.x, targetCoord.y));
        if (current.x !== targetCoord.x || current.y !== targetCoord.y) {
          moved = true;
        }
        targetIndex += 1;
      }
    }
  }

  const fullTiles = movedTiles.map((tile) => ({ ...tile, isNew: false }));
  return { tiles: fullTiles, moved, score };
}

function canMakeMove(tiles) {
  if (tiles.length < GRID_SIZE * GRID_SIZE) {
    return true;
  }

  const map = new Map(tiles.map((tile) => [`${tile.x}-${tile.y}`, tile]));

  for (const tile of tiles) {
    const right = map.get(`${tile.x + 1}-${tile.y}`);
    const down = map.get(`${tile.x}-${tile.y + 1}`);
    if ((right && right.value === tile.value) || (down && down.value === tile.value)) {
      return true;
    }
  }

  return false;
}

export default function TwentyFortyEightGame() {
  const nextId = useRef(1);
  const [tiles, setTiles] = useState(() => createStartingTiles(nextId));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const sortedTiles = useMemo(
    () => [...tiles].sort((a, b) => a.id - b.id),
    [tiles],
  );

  const restart = () => {
    nextId.current = 1;
    setTiles(createStartingTiles(nextId));
    setScore(0);
    setGameOver(false);
  };

  const addRandomTile = (nextTiles) => {
    const occupied = new Set(nextTiles.map((tile) => `${tile.x}-${tile.y}`));
    const { x, y } = getRandomPosition(occupied);
    const highestValue = getHighestTileValue(nextTiles);
    const spawnValue = getSpawnValue(highestValue);
    return [
      ...nextTiles,
      createTile(nextId.current++, spawnValue, x, y, { isNew: true }),
    ];
  };

  const move = (direction) => {
    if (gameOver) return;

    const { tiles: movedTiles, moved, score: moveScore } = moveTiles(tiles, direction);
    if (!moved) {
      return;
    }

    const nextTiles = addRandomTile(movedTiles);
    setTiles(nextTiles);
    setScore((current) => current + moveScore);
    if (!canMakeMove(nextTiles)) {
      setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const direction = KEY_MAP[event.key];
      if (!direction) {
        return;
      }
      event.preventDefault();
      move(direction);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, tiles]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTiles((currentTiles) =>
        currentTiles.map((tile) => ({ ...tile, isNew: false, isMerged: false })),
      );
    }, 220);

    return () => window.clearTimeout(timer);
  }, [tiles]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>2048</h2>
          <p className={styles.subtitle}>Combine tiles and reach the highest score.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Score</span>
            <strong>{score}</strong>
          </div>
          <button className={styles.button} type="button" onClick={restart}>
            Restart
          </button>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.boardInner}>
          <div className={styles.gridBase}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
              <div key={index} className={styles.backgroundCell} />
            ))}
          </div>

          {sortedTiles.map((tile) => (
            <div
              key={tile.id}
              className={`${styles.tile} ${styles[`tile${tile.value}`] || ''} ${
                tile.isNew ? styles.newTile : ''
              } ${tile.isMerged ? styles.mergedTile : ''}`}
              style={{
                left: `calc((var(--cell-size) + var(--gap)) * ${tile.x})`,
                top: `calc((var(--cell-size) + var(--gap)) * ${tile.y})`,
              }}
            >
              {tile.value}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <p>Use arrow keys to move the tiles. Merge equal tiles to grow your score.</p>
        {gameOver && <div className={styles.gameOver}>Game over — press restart to try again.</div>}
      </div>
    </div>
  );
}
