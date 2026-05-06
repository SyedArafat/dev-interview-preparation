import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import {
  collection, addDoc, updateDoc, doc,
  increment, serverTimestamp, getDocs, orderBy, query,
} from 'firebase/firestore'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { db } from '../../lib/firebase'
import { useTheme } from '../../hooks/useTheme'
import './AddTopic.css'
import './AddQuestion.css'

const DIFFICULTIES = [
  { value: 'beginner',     label: 'Beginner',     color: '#10b981' },
  { value: 'intermediate', label: 'Intermediate',  color: '#f59e0b' },
  { value: 'advanced',     label: 'Advanced',      color: '#ef4444' },
]

export default function AddQuestion() {
  const navigate       = useNavigate()
  const { theme }      = useTheme()

  const [topics,     setTopics]     = useState([])
  const [topicId,    setTopicId]    = useState('')
  const [question,   setQuestion]   = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [priority,   setPriority]   = useState(1)
  const [answer,     setAnswer]     = useState(
    '## Answer\n\nWrite your answer here. You can use:\n\n- **Bold**, *italic*, `code`\n- Code blocks:\n\n```javascript\nconsole.log("Hello!")\n```\n\n- Tables, lists, blockquotes — all standard Markdown.\n'
  )
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)
  const [savedQ,     setSavedQ]     = useState('')

  // Load topics for dropdown
  useEffect(() => {
    getDocs(query(collection(db, 'topics'), orderBy('title')))
      .then(snap => setTopics(snap.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))))
      .catch(() => {
        // fallback: unordered fetch
        getDocs(collection(db, 'topics'))
          .then(snap => setTopics(snap.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))))
          .catch(() => {})
      })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!topicId)          return setError('Please select a topic.')
    if (!question.trim())  return setError('Question text is required.')
    if (!answer.trim() || answer.length < 20) return setError('Please write a proper answer.')

    setLoading(true)
    try {
      // Write question document
      await addDoc(collection(db, 'questions'), {
        topicId,
        question:   question.trim(),
        difficulty,
        priority:   Number(priority) || 1,
        answer:     answer.trim(),
        createdAt:  serverTimestamp(),
      })

      // Atomically increment questionsCount on the topic
      await updateDoc(doc(db, 'topics', topicId), {
        questionsCount: increment(1),
      })

      setSavedQ(question.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to save question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddAnother() {
    setQuestion(''); setPriority(1); setDifficulty('intermediate')
    setAnswer('## Answer\n\nWrite your answer here.\n')
    setSuccess(false); setError('')
  }

  if (success) {
    return (
      <div className="form-page">
        <div className="form-success">
          <div className="form-success__icon"><CheckCircle2 size={44} /></div>
          <h2 className="form-success__title">Question saved!</h2>
          <p className="form-success__sub">
            "<strong>{savedQ.slice(0, 80)}{savedQ.length > 80 ? '…' : ''}</strong>"
            <br />has been added to the <strong>{topicId}</strong> topic.
            <br />The question count was automatically incremented.
          </p>
          <div className="form-success__actions">
            <button className="btn btn--primary" onClick={handleAddAnother}>Add another question</button>
            <button className="btn btn--ghost" onClick={() => navigate('/admin')}>Back to dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page form-page--wide">
      <div className="form-page__header">
        <button className="form-back-btn" onClick={() => navigate('/admin')}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div>
          <p className="form-page__eyebrow">Content Management</p>
          <h1 className="form-page__title">Add New Question</h1>
          <p className="form-page__sub">Write a question and a full Markdown answer with code, tables, and more.</p>
        </div>
      </div>

      {error && <div className="form-error"><span>⚠</span> {error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Meta section */}
        <div className="form-section">
          <h3 className="form-section__title">Question Details</h3>

          <div className="form-row form-row--3">
            {/* Topic */}
            <div className="form-group">
              <label className="form-label" htmlFor="topicId">
                Topic <span className="form-required">*</span>
              </label>
              <select
                id="topicId"
                className="form-select"
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                required
              >
                <option value="">— Select topic —</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label className="form-label">
                Difficulty <span className="form-required">*</span>
              </label>
              <div className="difficulty-group">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    className={`diff-btn diff-btn--${d.value} ${difficulty === d.value ? 'diff-btn--active' : ''}`}
                    onClick={() => setDifficulty(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority (sort order)</label>
              <input
                id="priority"
                type="number"
                className="form-input"
                min={1}
                value={priority}
                onChange={e => setPriority(e.target.value)}
              />
              <p className="form-hint">Lower number = shown first within the topic.</p>
            </div>
          </div>

          {/* Question text */}
          <div className="form-group">
            <label className="form-label" htmlFor="question">
              Question <span className="form-required">*</span>
            </label>
            <textarea
              id="question"
              className="form-textarea"
              placeholder="e.g. What is the difference between var, let, and const?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>

        {/* Answer editor */}
        <div className="form-section form-section--editor">
          <h3 className="form-section__title">
            Answer <span className="form-required">*</span>
            <span className="editor-hint">Supports full Markdown — code blocks, tables, lists, bold, italic, blockquotes</span>
          </h3>

          <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className="md-editor-wrap">
            <MDEditor
              value={answer}
              onChange={val => setAnswer(val || '')}
              height={480}
              preview="live"
              visibleDragbar={false}
              style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin')}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Saving…</> : 'Save Question'}
          </button>
        </div>
      </form>
    </div>
  )
}

