import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Header from '../components/Header'
import { topics } from '../data/topics'
import questionsData from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import './TopicPage.css'

const DIFFICULTY_COLOR = {
  beginner:     { label: 'Beginner',     bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  intermediate: { label: 'Intermediate', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  advanced:     { label: 'Advanced',     bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
}

function QuestionItem({ question, isRead, onToggleRead }) {
  const [open, setOpen] = useState(false)
  const diff = DIFFICULTY_COLOR[question.difficulty] || DIFFICULTY_COLOR.intermediate

  return (
    <div className={`q-item ${open ? 'q-item--open' : ''} ${isRead ? 'q-item--read' : ''}`}>
      {/* Question header */}
      <button
        className="q-item__header"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span
          className="q-item__read-dot"
          aria-label={isRead ? 'Completed' : 'Not completed'}
        >
          {isRead
            ? <CheckCircle2 size={18} className="q-item__check--done" />
            : <Circle size={18} className="q-item__check--empty" />
          }
        </span>

        <span className="q-item__question">{question.question}</span>

        <span
          className="q-item__difficulty"
          style={{ background: diff.bg, color: diff.color }}
        >
          {diff.label}
        </span>

        <span className="q-item__chevron">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Answer */}
      {open && (
        <div className="q-item__body">
          <div className="answer-body">
            <ReactMarkdown>{question.answer}</ReactMarkdown>
          </div>
          <button
            className={`q-item__mark-btn ${isRead ? 'q-item__mark-btn--done' : ''}`}
            onClick={() => onToggleRead(question.id)}
          >
            {isRead ? (
              <>
                <CheckCircle2 size={15} /> Marked as done
              </>
            ) : (
              <>
                <Circle size={15} /> Mark as done
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function TopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { isRead, toggleRead, getTopicProgress } = useProgress()

  const topic = topics.find((t) => t.id === topicId)
  const questions = questionsData[topicId] || []
  const { done, total } = getTopicProgress(questions)
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

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
        {/* Back */}
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Topics
        </button>

        {/* Topic header */}
        <div className="topic-header">
          <div className="topic-header__icon-wrap" style={{ '--topic-color': topic.color }}>
            <i className={`${topic.devicon} topic-header__icon`} />
          </div>

          <div className="topic-header__info">
            <h1 className="topic-header__name">{topic.name}</h1>
            <p className="topic-header__meta">
              {total} questions
              {done > 0 && (
                <span className="topic-header__done">
                  &nbsp;·&nbsp;{done} done ({pct}%)
                </span>
              )}
            </p>

            {/* Progress bar */}
            <div className="topic-header__progress-track">
              <div
                className="topic-header__progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Questions list */}
        <section className="questions-list">
          {questions.length === 0 ? (
            <p className="questions-empty">No questions yet for this topic.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="q-wrapper">
                <span className="q-number">{idx + 1}</span>
                <QuestionItem
                  question={q}
                  isRead={isRead(q.id)}
                  onToggleRead={toggleRead}
                />
              </div>
            ))
          )}
        </section>

        {/* Completion banner */}
        {done === total && total > 0 && (
          <div className="completion-banner">
            <CheckCircle2 size={22} />
            <div>
              <strong>All done! 🎉</strong>
              <p>You've completed all {total} questions in {topic.name}.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default TopicPage

