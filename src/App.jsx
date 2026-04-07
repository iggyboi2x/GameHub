import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import WordleGame from './games/wordle/index';
import SnakeGame from './games/snake/index';
import TetrisGame from './games/tetris/index';
import AnagramGame from './games/anagram/index';
import TwentyFortyEightGame from './games/2048/index';
import SpaceShooterGame from './games/space-shooter/index';
import CrosswordGame from './games/crossword/index';
import WordConnectGame from './games/word-connect/index';
import WhackAMoleGame from './games/whack-a-mole/index';
import MemoryMatchGame from './games/memory-match/index';
import SudokuGame from './games/sudoku/index';
import MinesweeperGame from './games/minesweeper/index';
import DailyQuizGame from './games/daily-quiz/index';
import './index.css';

function GameShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/play/wordle"
          element={<GameShell><WordleGame /></GameShell>}
        />
        <Route
          path="/play/snake"
          element={<GameShell><SnakeGame /></GameShell>}
        />
        <Route
          path="/play/anagram"
          element={<GameShell><AnagramGame /></GameShell>}
        />
        <Route
          path="/play/tetris"
          element={<GameShell><TetrisGame /></GameShell>}
        />
        <Route
          path="/play/2048"
          element={<GameShell><TwentyFortyEightGame /></GameShell>}
        />
        <Route
          path="/play/space-shooter"
          element={<GameShell><SpaceShooterGame /></GameShell>}
        />
        <Route
          path="/play/crossword"
          element={<GameShell><CrosswordGame /></GameShell>}
        />
        <Route
          path="/play/word-connect"
          element={<GameShell><WordConnectGame /></GameShell>}
        />
        <Route
          path="/play/whack-a-mole"
          element={<GameShell><WhackAMoleGame /></GameShell>}
        />
        <Route
          path="/play/memory-match"
          element={<GameShell><MemoryMatchGame /></GameShell>}
        />
        <Route
          path="/play/sudoku"
          element={<GameShell><SudokuGame /></GameShell>}
        />
        <Route
          path="/play/minesweeper"
          element={<GameShell><MinesweeperGame /></GameShell>}
        />
        <Route
          path="/play/daily-quiz"
          element={<GameShell><DailyQuizGame /></GameShell>}
        />
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
              <h2 style={{ fontSize: 48, fontWeight: 800, color: 'var(--pink)' }}>404</h2>
              <p>Page not found.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
