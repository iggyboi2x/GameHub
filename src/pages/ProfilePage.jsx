import styles from './ProfilePage.module.css';
import { GAMES } from '../data/games.js';

// Mock user data
const MOCK_USER = {
  displayName: 'GameMaster',
  username: '@gamemaster2024',
  avatar: 'GM',
  stats: {
    gamesPlayed: 247,
    totalScore: 125430,
    bestStreak: 12,
    achievements: 8,
  },
  achievements: [
    { id: 1, title: 'First Victory', desc: 'Win your first game', icon: '🏆', unlocked: true },
    { id: 2, title: 'Word Wizard', desc: 'Complete 10 Wordle games', icon: '🔤', unlocked: true },
    { id: 3, title: 'Snake Master', desc: 'Score 10,000+ in Snake', icon: '🐍', unlocked: true },
    { id: 4, title: 'Puzzle Solver', desc: 'Complete 50 puzzles', icon: '🧩', unlocked: true },
    { id: 5, title: 'Speed Demon', desc: 'Complete a game in under 30 seconds', icon: '⚡', unlocked: true },
    { id: 6, title: 'Perfectionist', desc: 'Get a perfect score', icon: '💎', unlocked: true },
    { id: 7, title: 'Marathon Player', desc: 'Play for 5 hours straight', icon: '🏃', unlocked: false },
    { id: 8, title: 'Legend', desc: 'Reach top 10 in 5 different games', icon: '👑', unlocked: false },
  ],
  recentGames: [
    { game: 'wordle', score: 1850, date: '2 hours ago', color: '#FF2D78', icon: 'W' },
    { game: 'snake', score: 8750, date: '5 hours ago', color: '#39FF14', icon: 'S' },
    { game: 'tetris', score: 45200, date: '1 day ago', color: '#BF5FFF', icon: 'T' },
    { game: 'sudoku', score: 2890, date: '2 days ago', color: '#00E5FF', icon: '9' },
    { game: '2048', score: 32768, date: '3 days ago', color: '#FFE000', icon: '2k' },
  ],
};

export default function ProfilePage() {
  // For demo purposes, we'll show the profile. In a real app, check if user is signed in
  const isSignedIn = true; // Mock signed in state

  if (!isSignedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.signInPrompt}>
          <div className={styles.signInIcon}>👤</div>
          <h1 className={styles.signInTitle}>Sign in to view your profile</h1>
          <p className={styles.signInText}>
            Track your scores, view achievements, and compete with friends by signing in to your account.
          </p>
          <button className={styles.signInBtn}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Your gaming journey and achievements</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{MOCK_USER.avatar}</div>
          <h2 className={styles.displayName}>{MOCK_USER.displayName}</h2>
          <p className={styles.username}>{MOCK_USER.username}</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{MOCK_USER.stats.gamesPlayed}</span>
              <span className={styles.statLabel}>Games Played</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{MOCK_USER.stats.totalScore.toLocaleString()}</span>
              <span className={styles.statLabel}>Total Score</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{MOCK_USER.stats.bestStreak}</span>
              <span className={styles.statLabel}>Best Streak</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{MOCK_USER.stats.achievements}</span>
              <span className={styles.statLabel}>Achievements</span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🏆 Achievements</h3>
            <div className={styles.achievements}>
              {MOCK_USER.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`${styles.achievement} ${!achievement.unlocked ? styles.locked : ''}`}
                >
                  <div className={styles.achievementIcon}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className={styles.achievementContent}>
                    <h4>{achievement.title}</h4>
                    <p>{achievement.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎮 Recent Games</h3>
            <div className={styles.recentGames}>
              {MOCK_USER.recentGames.map((game, index) => {
                const gameData = GAMES.find(g => g.slug === game.game);
                return (
                  <div key={index} className={styles.gameEntry}>
                    <div className={styles.gameInfo}>
                      <div
                        className={styles.gameIcon}
                        style={{ backgroundColor: game.color }}
                      >
                        {game.icon}
                      </div>
                      <div className={styles.gameDetails}>
                        <h4>{gameData?.title || game.game}</h4>
                        <p>{game.date}</p>
                      </div>
                    </div>
                    <div className={styles.gameScore}>
                      <span className={styles.score}>{game.score.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
