import { useState, useMemo } from 'react'
import { Search, BookOpen, Code2, Award } from 'lucide-react'
import Header from '../components/Header'
import TopicCard from '../components/TopicCard'
import { topics, categories } from '../data/topics'
import questionsData from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import './HomePage.css'

const TOTAL_QUESTIONS = Object.values(questionsData).reduce(
  (sum, arr) => sum + arr.length,
  0,
)

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { getTopicProgress } = useProgress()

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) =>
        activeCategory === 'all' ? true : t.category === activeCategory,
      )
      .filter((t) =>
        searchQuery.trim()
          ? t.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      )
  }, [activeCategory, searchQuery])

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
              className="hero__search"
              type="text"
              placeholder="Search topics… e.g. React, Docker, Python"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search topics"
            />
            {searchQuery && (
              <button
                className="hero__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <BookOpen size={15} />
              <span>
                <strong>{topics.length}</strong> Topics
              </span>
            </div>
            <div className="hero__stat-dot" />
            <div className="hero__stat">
              <Award size={15} />
              <span>
                <strong>{TOTAL_QUESTIONS}+</strong> Questions
              </span>
            </div>
            <div className="hero__stat-dot" />
            <div className="hero__stat">
              <Code2 size={15} />
              <span>
                <strong>100%</strong> Free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Topics ────────────────────────────────────── */}
      <main className="topics-section container">
        {/* Category filter */}
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

        {/* Results label */}
        {searchQuery && (
          <p className="topics-results-label">
            {filteredTopics.length === 0
              ? `No results for "${searchQuery}"`
              : `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''} for "${searchQuery}"`}
          </p>
        )}

        {/* Grid */}
        {filteredTopics.length > 0 ? (
          <div className="topics-grid">
            {filteredTopics.map((topic) => {
              const qs = questionsData[topic.id] || []
              const { done, total } = getTopicProgress(qs)
              return (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  done={done}
                  total={total}
                />
              )
            })}
          </div>
        ) : (
          <div className="topics-empty">
            <p>No topics found.</p>
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="footer container">
        <p>
          © {new Date().getFullYear()} Dev Interview Prep — Built for developers,
          by developers.
        </p>
      </footer>
    </div>
  )
}

export default HomePage

