import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, BookOpen, Code2, Award, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import TopicCard from '../components/TopicCard'
import { categories } from '../data/topics'
import { useTopics } from '../hooks/useTopics'
import { useProgress } from '../hooks/useProgress'
import './HomePage.css'

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)
  const { getTopicProgress, progress } = useProgress()
  const { topics, loading: topicsLoading, error: topicsError } = useTopics()

  console.log('HomePage - topics:', topics, 'loading:', topicsLoading, 'error:', topicsError)

  const TOTAL_QUESTIONS = useMemo(
    () => topics.reduce((sum, t) => sum + (t.questionsCount || 0), 0),
    [topics],
  )

  // ⌘K / Ctrl+K focuses the search bar
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
    console.log('Filtering topics:', { topics, activeCategory, searchQuery })
    return topics
      .filter((t) => {
        // If activeCategory is 'all', show all. Otherwise filter by category if it exists
        if (activeCategory === 'all') return true
        return (t.category || 'other') === activeCategory
      })
      .filter((t) =>
        searchQuery.trim()
          ? t.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
  }, [topics, activeCategory, searchQuery])

  // Overall progress across all topics
  const totalDone = useMemo(() => Object.keys(progress).length, [progress])
  const overallPct = TOTAL_QUESTIONS > 0
    ? Math.round((totalDone / TOTAL_QUESTIONS) * 100)
    : 0

  const isMac = navigator.platform?.toUpperCase().includes('MAC')

  return (
    <div className="home">
      <Header />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero__badge">
            <Code2 size={13} />
            <span>Free for developers</span>
          </div>

          <h1 className="hero__title">
            Ace Your Next
            <span className="hero__title-accent"> Developer </span>
            Interview
          </h1>

          <p className="hero__subtitle">
            Curated interview questions across {topics.length} topics with
            in-depth answers. Track your progress as you prepare.
          </p>

          {/* Search */}
          <div className="hero__search-wrap">
            <Search size={18} className="hero__search-icon" />
            <input
              ref={searchRef}
              className="hero__search"
              type="text"
              placeholder="Search topics… e.g. React, Docker, Python"
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
                ✕
              </button>
            ) : (
              <kbd className="hero__search-kbd">
                {isMac ? '⌘' : 'Ctrl'}K
              </kbd>
            )}
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat-pill">
              <BookOpen size={14} />
              <strong>{topics.length}</strong> Topics
            </div>
            <div className="hero__stat-pill">
              <Award size={14} />
              <strong>{TOTAL_QUESTIONS}</strong> Questions
            </div>
            <div className="hero__stat-pill hero__stat-pill--green">
              <TrendingUp size={14} />
              <strong>100%</strong> Free
            </div>
          </div>
        </div>
      </section>

      {/* ── Overall Progress Banner ────────────────────── */}
      {totalDone > 0 && (
        <div className="progress-banner container">
          <div className="progress-banner__info">
            <TrendingUp size={16} />
            <span>
              <strong>{totalDone}</strong> of <strong>{TOTAL_QUESTIONS}</strong> questions completed
            </span>
          </div>
          <div className="progress-banner__bar-wrap">
            <div className="progress-banner__bar">
              <div
                className="progress-banner__fill"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <span className="progress-banner__pct">{overallPct}%</span>
          </div>
        </div>
      )}

      {/* ── Topics ────────────────────────────────────── */}
      <main className="topics-section container">
        {/* Category filter */}
        <div className="category-tabs-wrap">
          <div className="category-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'category-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
                {cat.id !== 'all' && (
                  <span className="category-tab__count">
                    {topics.filter((t) => t.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section header row */}
        <div className="topics-header">
          <p className="topics-header__label">
            {searchQuery ? (
              filteredTopics.length === 0
                ? `No results for "${searchQuery}"`
                : `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''} for "${searchQuery}"`
            ) : (
              <>Showing <strong>{filteredTopics.length}</strong> topic{filteredTopics.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        {/* Grid */}
        {topicsLoading ? (
          <div className="topics-loading">Loading topics…</div>
        ) : topicsError ? (
          <div className="topics-error">Failed to load topics. Please try again.</div>
        ) : filteredTopics.length > 0 ? (
          <div className="topics-grid">
            {filteredTopics.map((topic) => {
              console.log('Rendering topic card:', topic)
              const { done, total } = getTopicProgress([])
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
            <div className="topics-empty__icon">
              <Search size={32} />
            </div>
            <p className="topics-empty__title">No topics found</p>
            <p className="topics-empty__sub">
              Try a different keyword or{' '}
              <button onClick={() => { setSearchQuery(''); setActiveCategory('all') }}>
                clear filters
              </button>
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────── */}
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
