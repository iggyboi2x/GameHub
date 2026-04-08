import { useState } from 'react';
import styles from './LeaderboardPage.module.css';
import { GAMES, CATEGORIES } from '../data/games.js';

// Mock leaderboard data
const MOCK_LEADERBOARD = {
  wordle: [
    { rank: 1, name: 'WordMaster', score: 2450, avatar: 'WM' },
    { rank: 2, name: 'PuzzlePro', score: 2380, avatar: 'PP' },
    { rank: 3, name: 'LexiLover', score: 2310, avatar: 'LL' },
    { rank: 4, name: 'BrainTeaser', score: 2280, avatar: 'BT' },
    { rank: 5, name: 'WordWizard', score: 2250, avatar: 'WW' },
  ],
  snake: [
    { rank: 1, name: 'SlitherKing', score: 15420, avatar: 'SK' },
    { rank: 2, name: 'SnakeCharmer', score: 14850, avatar: 'SC' },
    { rank: 3, name: 'ViperVenom', score: 14200, avatar: 'VV' },
    { rank: 4, name: 'CobraStrike', score: 13900, avatar: 'CS' },
    { rank: 5, name: 'PythonPower', score: 13500, avatar: 'PP' },
  ],
  tetris: [
    { rank: 1, name: 'BlockMaster', score: 98750, avatar: 'BM' },
    { rank: 2, name: 'LineClearer', score: 95200, avatar: 'LC' },
    { rank: 3, name: 'TetrisGod', score: 91800, avatar: 'TG' },
    { rank: 4, name: 'ShapeShifter', score: 89400, avatar: 'SS' },
    { rank: 5, name: 'BlockBuster', score: 87100, avatar: 'BB' },
  ],
  sudoku: [
    { rank: 1, name: 'NumberNinja', score: 3240, avatar: 'NN' },
    { rank: 2, name: 'GridMaster', score: 3180, avatar: 'GM' },
    { rank: 3, name: 'PuzzleSolver', score: 3120, avatar: 'PS' },
    { rank: 4, name: 'LogicLord', score: 3090, avatar: 'LL' },
    { rank: 5, name: 'DigitDude', score: 3050, avatar: 'DD' },
  ],
  '2048': [
    { rank: 1, name: 'MergeMaster', score: 524288, avatar: 'MM' },
    { rank: 2, name: 'TileTitan', score: 262144, avatar: 'TT' },
    { rank: 3, name: 'PowerPlayer', score: 131072, avatar: 'PP' },
    { rank: 4, name: 'BlockBoss', score: 65536, avatar: 'BB' },
    { rank: 5, name: 'NumberKing', score: 32768, avatar: 'NK' },
  ],
};

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getFilteredGames = () => {
    if (selectedCategory === 'All') {
      return GAMES.filter(game => game.available && MOCK_LEADERBOARD[game.slug]);
    }
    return GAMES.filter(game =>
      game.available &&
      game.category === selectedCategory &&
      MOCK_LEADERBOARD[game.slug]
    );
  };

  const formatScore = (score, gameSlug) => {
    if (gameSlug === '2048' || gameSlug === 'snake' || gameSlug === 'tetris') {
      return score.toLocaleString();
    }
    return score.toString();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Leaderboard</h1>
        <p className={styles.subtitle}>Top players across all games</p>

        <div className={styles.filters}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`${styles.filterBtn} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.leaderboard}>
        {getFilteredGames().map(game => (
          <div key={game.id} className={styles.gameSection}>
            <h2 className={styles.gameTitle}>
              <div
                className={styles.gameIcon}
                style={{ backgroundColor: game.color }}
              >
                {game.icon}
              </div>
              {game.title}
            </h2>

            <div className={styles.entries}>
              {MOCK_LEADERBOARD[game.slug].map(entry => (
                <div key={entry.rank} className={styles.entry}>
                  <div className={styles.rank}>#{entry.rank}</div>
                  <div className={styles.player}>
                    <div className={styles.avatar}>{entry.avatar}</div>
                    <span className={styles.playerName}>{entry.name}</span>
                  </div>
                  <div className={styles.score}>
                    {formatScore(entry.score, game.slug)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {getFilteredGames().length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🏆</div>
            <p>No leaderboard data available for this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
