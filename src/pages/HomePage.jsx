import { useState } from 'react';
import { GAMES, CATEGORIES } from '../data/games';
import GameCard from '../components/GameCard';
import styles from './HomePage.module.css';

const STATS = [
  { label: 'Games', value: '13' },
  { label: 'Players', value: '89k' },
  { label: 'Plays today', value: '3.2k' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = GAMES.filter((g) => {
    const matchCat = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.bgGrid} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          Live — 3 new games coming soon
        </div>

        <h1 className={styles.heading}>
          Play. Compete.<br />
          <span className={styles.headingGhost}>Beat yourself.</span>
        </h1>

        <p className={styles.sub}>
          Original browser games, built from scratch. No downloads,
          no installs — just open and play.
        </p>

        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filters}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Game Grid */}
      <section className={styles.grid}>
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>
            No games found for &ldquo;{search}&rdquo;
          </div>
        )}
      </section>
    </div>
  );
}
