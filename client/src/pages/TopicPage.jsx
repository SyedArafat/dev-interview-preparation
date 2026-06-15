import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, Circle,
  Search, X, Trophy, Target, Layers,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'
import Header from '../components/Header'
import NoteEditor from '../components/NoteEditor'
import { useTopics } from '../hooks/useTopics'
import { useQuestions } from '../hooks/useQuestions'
import { useProgress } from '../hooks/useProgress'
import './TopicPage.css'

/* ── Answer body ─────────────────────────────────────── */
const DIFFICULTY = {
  beginner:     { label: 'Beginner',     cls: 'diff--beginner' },
  intermediate: { label: 'Intermediate', cls: 'diff--intermediate' },
  advanced:     { label: 'Advanced',     cls: 'diff--advanced' },
}

const DIFF_FILTERS = [
  { id: 'all',          label: 'All' },
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
]

/* ── SVG Progress Ring ──────────────────────────────── */
function ProgressRing({ pct, size = 100, stroke = 8 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        className="progress-ring__track"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        className="progress-ring__fill"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ── Question Card ──────────────────────────────────── */
function QuestionItem({ question, index, isRead, onToggleRead }) {
  const [open, setOpen] = useState(false)
  const diff = DIFFICULTY[question.difficulty] || DIFFICULTY.intermediate

  return (
    <div
      className={[
        'q-card',
        open    ? 'q-card--open' : '',
        isRead  ? 'q-card--done' : '',
        `q-card--${question.difficulty}`,
      ].join(' ')}
    >
      <button
        className="q-card__header"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
      >
        <span className="q-card__num">{index + 1}</span>

        <span className="q-card__check">
          {isRead
            ? <CheckCircle2 size={18} className="check--done" />
            : <Circle       size={18} className="check--empty" />}
        </span>

        <span className="q-card__text">{question.question}</span>

        <span className={`q-card__diff ${diff.cls}`}>{diff.label}</span>

        <span className="q-card__chevron">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

       {open && (
         <div className="q-card__body">
           <div className="answer-body">
             <ReactMarkdown
               remarkPlugins={[remarkGfm]}
               rehypePlugins={[rehypeHighlight]}
             >
               {question.answer}
             </ReactMarkdown>
           </div>

          {/* ── Personal Note ── */}
          <NoteEditor questionId={question.id} />

          <div className="q-card__actions">
            <button
              className={`mark-btn ${isRead ? 'mark-btn--done' : ''}`}
              onClick={() => onToggleRead(question.id)}
            >
              {isRead
                ? <><CheckCircle2 size={14} /> Marked as done</>
                : <><Circle       size={14} /> Mark as done</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────── */
function TopicPage() {
  const { topicId }   = useParams()
  const navigate      = useNavigate()
  const { isRead, toggleRead, getTopicProgress } = useProgress()
  const { topics } = useTopics()
  const { questions, loading: questionsLoading, error: questionsError } = useQuestions(topicId)

  console.log('TopicPage - topicId:', topicId, 'questions:', questions, 'loading:', questionsLoading, 'error:', questionsError)

  const [search,     setSearch]     = useState('')
  const [diffFilter, setDiffFilter] = useState('all')

  const topic     = topics.find(t => t.id === topicId)
  const { done, total } = getTopicProgress(questions)
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const counts = useMemo(() => ({
    all:          questions.length,
    beginner:     questions.filter(q => q.difficulty === 'beginner').length,
    intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
    advanced:     questions.filter(q => q.difficulty === 'advanced').length,
  }), [questions])

  const filtered = useMemo(() => {
    let qs = questions
    if (diffFilter !== 'all') qs = qs.filter(q => q.difficulty === diffFilter)
    if (search.trim()) {
      const s = search.toLowerCase()
      qs = qs.filter(q => q.question.toLowerCase().includes(s))
    }
    return qs
  }, [questions, diffFilter, search])

  const hasFilter = diffFilter !== 'all' || search.trim()

  /* 404 */
  if (!topic) {
    return (
      <div className="topic-page">
        <Header />
        <div className="topic-notfound container">
          <p>Topic not found.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            <ArrowLeft size={16} /> Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="topic-page">
      <Header />

      <main className="container topic-main">

        {/* ── Back ────────────────────────────────────── */}
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Topics
        </button>

        {/* ── Topic Hero ──────────────────────────────── */}
        <div className="topic-hero" style={{ '--tc': topic.color }}>
          <div className="topic-hero__glow" />

          <div className="topic-hero__left">
            <div className="topic-hero__icon-wrap">
              <i className={`${topic.devicon} topic-hero__icon`} />
            </div>

            <div className="topic-hero__info">
              <p className="topic-hero__eyebrow">Interview Prep</p>
              <h1 className="topic-hero__name">{topic.name}</h1>
              <div className="topic-hero__stats">
                <div className="stat-chip">
                  <Layers size={12} />
                  <span><strong>{total}</strong> Questions</span>
                </div>
                <div className="stat-chip stat-chip--green">
                  <CheckCircle2 size={12} />
                  <span><strong>{done}</strong> Done</span>
                </div>
                <div className="stat-chip">
                  <Target size={12} />
                  <span><strong>{total - done}</strong> Remaining</span>
                </div>
              </div>
            </div>
          </div>

          <div className="topic-hero__right">
            <div className="topic-hero__ring-wrap">
              <ProgressRing pct={pct} size={104} stroke={9} />
              <div className="topic-hero__ring-inner">
                <span className="topic-hero__pct">{pct}%</span>
                <span className="topic-hero__pct-label">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Difficulty Progress Breakdown ────────────── */}
        <div className="diff-breakdown">
          <div className="diff-bar diff-bar--beginner"
               style={{ flex: counts.beginner || 0 }}>
          </div>
          <div className="diff-bar diff-bar--intermediate"
               style={{ flex: counts.intermediate || 0 }}>
          </div>
          <div className="diff-bar diff-bar--advanced"
               style={{ flex: counts.advanced || 0 }}>
          </div>
        </div>

        {/* ── Controls ────────────────────────────────── */}
        <div className="q-controls">
          <div className="q-search-wrap">
            <Search size={14} className="q-search__icon" />
            <input
              className="q-search"
              type="text"
              placeholder={`Search ${topic.name} questions…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="q-search__clear" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="diff-tabs" role="group" aria-label="Filter by difficulty">
            {DIFF_FILTERS.map(f => (
              <button
                key={f.id}
                className={[
                  'diff-tab',
                  `diff-tab--${f.id}`,
                  diffFilter === f.id ? 'diff-tab--active' : '',
                ].join(' ')}
                onClick={() => setDiffFilter(f.id)}
              >
                {f.label}
                <span className="diff-tab__count">{counts[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count / clear row */}
        <div className="q-meta-row">
          <p className="q-count-label">
            Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> questions
          </p>
          {hasFilter && (
            <button
              className="q-clear-btn"
              onClick={() => { setDiffFilter('all'); setSearch('') }}
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* ── Questions ───────────────────────────────── */}
        <section className="questions-list" aria-label="Questions">
          {questionsLoading ? (
            <div className="q-loading">Loading questions…</div>
          ) : questionsError ? (
            <div className="q-error">Failed to load questions. Please try again.</div>
          ) : filtered.length === 0 ? (
            <div className="q-empty">
              <div className="q-empty__icon"><Search size={26} /></div>
              <p className="q-empty__title">No questions match</p>
              <p className="q-empty__sub">Try a different keyword or difficulty level.</p>
            </div>
          ) : (
            filtered.map((q, idx) => (
              <QuestionItem
                key={q.id}
                question={q}
                index={idx}
                isRead={isRead(q.id)}
                onToggleRead={toggleRead}
              />
            ))
          )}
        </section>

        {/* ── Completion Banner ────────────────────────── */}
        {done === total && total > 0 && (
          <div className="completion-banner">
            <div className="completion-banner__icon">
              <Trophy size={26} />
            </div>
            <div className="completion-banner__text">
              <strong>You nailed it! 🎉</strong>
              <p>All {total} {topic.name} questions completed. Keep the momentum!</p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default TopicPage
