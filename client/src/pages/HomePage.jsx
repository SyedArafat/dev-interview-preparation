import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, BookOpen, Zap, TrendingUp, Sparkles, X } from 'lucide-react'
import Header from '../components/Header'
import TopicCard from '../components/TopicCard'
import { categories } from '../data/categories.js'
import { useTopics } from '../hooks/useTopics'
import { useProgress } from '../hooks/useProgress'
import './HomePage.css'

/* ── Skeleton card (loading placeholder) ──────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__icon" />
      <div className="skeleton-card__line skeleton-card__line--title" />
      <div className="skeleton-card__line skeleton-card__line--sub" />
    </div>
  )
}

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery]       = useState('')
  const searchRef = useRef(null)
  const { getTopicProgress, progress } = useProgress()
  const { topics, loading: topicsLoading, error: topicsError } = useTopics()

  const TOTAL_QUESTIONS = useMemo(
    () => topics.reduce((sum, t) => sum + (t.questionsCount || 0), 0),
    [topics],
  )

  /* ⌘K / Ctrl+K → focus search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => activeCategory === 'all' || (t.category || 'other') === activeCategory)
      .filter((t) =>
        searchQuery.trim()
          ? t.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
  }, [topics, activeCategory, searchQuery])

  /* Overall progress */
  const totalDone  = useMemo(() => Object.keys(progress).length, [progress])
  const overallPct = TOTAL_QUESTIONS > 0 ? Math.round((totalDone / TOTAL_QUESTIONS) * 100) : 0

  const isMac = navigator.platform?.toUpperCase().includes('MAC')

  return (
    <div className="home">
      <Header />

      {/* ══════════════════════════════════════
          HERO
         ══════════════════════════════════════ */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero__bg-grid"    aria-hidden="true" />
        <div className="hero__bg-glow-1"  aria-hidden="true" />
        <div className="hero__bg-glow-2"  aria-hidden="true" />

        <div className="container hero__container">
          {/* Badge */}
          <div className="hero__badge">
            <Sparkles size={12} />
            <span>Free for every developer</span>
          </div>

          {/* Headline */}
          <h1 className="hero__title">
            Ace Your Next
            <span className="hero__title-gradient"> Tech Interview</span>
          </h1>

          {/* Sub */}
          <p className="hero__subtitle">
            Curated questions across&nbsp;
            <strong className="hero__subtitle-accent">{topics.length || '25+'} tech topics</strong>
            &nbsp;with in-depth answers.&nbsp;
            Track your progress as you prepare.
          </p>

          {/* Search */}
          <div className="hero__search-wrap">
            <Search size={17} className="hero__search-icon" aria-hidden="true" />
            <input
              ref={searchRef}
              className="hero__search"
              type="text"
              placeholder="Search topics…  e.g. React, Docker, Python"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search topics"
            />
            {searchQuery ? (
              <button
                className="hero__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="hero__search-kbd">{isMac ? '⌘' : 'Ctrl'}K</kbd>
            )}
          </div>

          {/* Stats row */}
          <div className="hero__stats">
            <div className="hero__stat">
              <BookOpen size={15} className="hero__stat-icon" />
              <span><strong>{topics.length || '25'}</strong> Topics</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat">
              <Zap size={15} className="hero__stat-icon hero__stat-icon--yellow" />
              <span><strong>{TOTAL_QUESTIONS || '800'}+</strong> Questions</span>
            </div>
            <div className="hero__stat-divider" aria-hidden="true" />
            <div className="hero__stat hero__stat--green">
              <TrendingUp size={15} className="hero__stat-icon" />
              <span><strong>100%</strong> Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          OVERALL PROGRESS BANNER
         ══════════════════════════════════════ */}
      {totalDone > 0 && (
        <div className="progress-banner container">
          <div className="progress-banner__left">
            <div className="progress-banner__icon-wrap">
              <TrendingUp size={14} />
            </div>
            <span className="progress-banner__text">
              <strong>{totalDone}</strong> of <strong>{TOTAL_QUESTIONS}</strong> questions completed
            </span>
          </div>
          <div className="progress-banner__right">
            <div className="progress-banner__bar">
              <div className="progress-banner__fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="progress-banner__pct">{overallPct}%</span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TOPICS SECTION
         ══════════════════════════════════════ */}
      <main className="topics-section container">

        {/* Category filter tabs */}
        <div className="cat-tabs-wrap" role="tablist" aria-label="Filter topics by category">
          <div className="cat-tabs">
            {categories.map((cat) => {
              const count = cat.id === 'all'
                ? topics.length
                : topics.filter((t) => t.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className={`cat-tab ${activeCategory === cat.id ? 'cat-tab--active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="cat-tab__label">{cat.label}</span>
                  <span className="cat-tab__count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section meta row */}
        <div className="topics-meta">
          <p className="topics-meta__label">
            {searchQuery
              ? filteredTopics.length === 0
                ? `No results for "${searchQuery}"`
                : `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''} for "${searchQuery}"`
              : <>Showing <strong>{filteredTopics.length}</strong> topic{filteredTopics.length !== 1 ? 's' : ''}</>
            }
          </p>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              className="topics-meta__clear"
              onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {topicsLoading ? (
          <div className="topics-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : topicsError ? (
          <div className="topics-error-state">
            <div className="topics-error-state__icon">⚠</div>
            <p className="topics-error-state__title">Failed to load topics</p>
            <p className="topics-error-state__sub">Please check your connection and try again.</p>
          </div>
        ) : filteredTopics.length > 0 ? (
          <div className="topics-grid">
            {filteredTopics.map((topic) => {
              const { done } = getTopicProgress([])
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  done={done}
                  total={topic.questionsCount || 0}
                />
              )
            })}
          </div>
        ) : (
          <div className="topics-empty">
            <div className="topics-empty__icon"><Search size={28} /></div>
            <p className="topics-empty__title">No topics found</p>
            <p className="topics-empty__sub">
              Try a different keyword or&nbsp;
              <button onClick={() => { setSearchQuery(''); setActiveCategory('all') }}>
                clear filters
              </button>
            </p>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════
          FOOTER
         ══════════════════════════════════════ */}
      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__logo">&lt;/&gt; Dev Interview Prep</span>
          <p className="footer__copy">
            © {new Date().getFullYear()} · Built for developers, by developers
          </p>
          <div className="footer__links">
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
