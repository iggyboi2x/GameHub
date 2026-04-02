import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import WordleGame from './games/wordle/index';
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
