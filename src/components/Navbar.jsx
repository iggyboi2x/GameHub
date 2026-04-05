import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      // Ignore localStorage errors.
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      // Ignore localStorage errors.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <div className={styles.logoIcon}>🕹</div>
        <span>GAME<span className={styles.accent}>HUB</span></span>
      </Link>

      <div className={styles.actions}>
        <Link
          to="/leaderboard"
          className={`${styles.ghost} ${location.pathname === '/leaderboard' ? styles.active : ''}`}
        >
          Leaderboard
        </Link>
        <Link
          to="/profile"
          className={`${styles.ghost} ${location.pathname === '/profile' ? styles.active : ''}`}
        >
          Profile
        </Link>
        <button className={styles.themeToggle} onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className={styles.cta}>Sign in</button>
      </div>
    </nav>
  );
}
