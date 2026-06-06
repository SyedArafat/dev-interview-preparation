import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, limit, orderBy, startAfter } from 'firebase/firestore'
import { ArrowLeft, Search, Edit2, Trash2, AlertCircle, X, ChevronDown } from 'lucide-react'
import { db } from '../../lib/firebase'
import './ManageQuestions.css'

// ─── CONFIG ──────────────────────────────────────
const QUESTIONS_PER_PAGE = 100

export default function ManageQuestions() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  // Debounced search effect (backend search)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search && search.length >= 2) {
        performBackendSearch(search)
      } else if (!selectedTopic) {
        // No search, no filter - show loaded questions
        let filtered = questions
        filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0))
        setFilteredQuestions(filtered)
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, questions])

  // Filter effect for topic selection (client-side on loaded questions)
  useEffect(() => {
    if (!search && selectedTopic) {
      let filtered = questions.filter(q => q.topicId === selectedTopic.id)
      filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0))
      setFilteredQuestions(filtered)
      console.log('Filtered by topic:', selectedTopic.id, 'Found:', filtered.length, 'questions')
    } else if (!search && !selectedTopic) {
      let filtered = [...questions]
      filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0))
      setFilteredQuestions(filtered)
    }
  }, [selectedTopic, questions, search])

  async function loadInitialData() {
    try {
      setLoading(true)
      const topicsSnap = await getDocs(collection(db, 'topics'))

      const topicsData = topicsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(t => !t.deletedAt)
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      
      setTopics(topicsData)

      // Load first page of questions
      await loadQuestions(true)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadQuestions(isInitial = false) {
    try {
      if (!isInitial) setLoadingMore(true)

      let q = query(
        collection(db, 'questions'),
        orderBy('topicId'),
        limit(QUESTIONS_PER_PAGE)
      )

      // Pagination: start after last doc
      if (!isInitial && lastDoc) {
        q = query(
          collection(db, 'questions'),
          orderBy('topicId'),
          startAfter(lastDoc),
          limit(QUESTIONS_PER_PAGE)
        )
      }

      const snap = await getDocs(q)

      const newQuestions = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(q => !q.deletedAt)

      // Update state
      setQuestions(prev => isInitial ? newQuestions : [...prev, ...newQuestions])
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === QUESTIONS_PER_PAGE)
    } catch (err) {
      console.error('Error loading questions:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  async function performBackendSearch(searchTerm) {
    try {
      setIsSearching(true)

      // Search across all questions (no limit when searching)
      const q = query(
        collection(db, 'questions'),
        orderBy('topicId')
      )

      const snap = await getDocs(q)

      const allQuestions = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(q => !q.deletedAt)

      // Client-side text filter (Firestore doesn't support full-text search)
      const filtered = allQuestions.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topicId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
      )

      filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0))
      setFilteredQuestions(filtered)
      console.log('Backend search for:', searchTerm, 'Found:', filtered.length, 'questions')
    } catch (err) {
      console.error('Error searching questions:', err)
    } finally {
      setIsSearching(false)
    }
  }

  function handleLoadMore() {
    loadQuestions(false)
  }

  function handleTopicClick(topic) {
    const newTopic = selectedTopic?.id === topic.id ? null : topic
    setSelectedTopic(newTopic)
    setSearch('') // Clear search when switching topics
    console.log('Selected topic:', newTopic?.id, 'Questions with this topicId:', questions.filter(q => q.topicId === newTopic?.id).length)
  }

  function clearFilter() {
    setSelectedTopic(null)
    setSearch('')
  }

  function handleEdit(questionId) {
    navigate(`/admin/questions/${questionId}/edit`)
  }

  function handleDeleteClick(question) {
    setDeleteConfirm(question)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      navigate(`/admin/questions/${deleteConfirm.id}/delete`)
    } catch (err) {
      console.error('Error deleting question:', err)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#10b981'
      case 'intermediate':
        return '#f59e0b'
      case 'advanced':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="form-page form-page--wide">
        <div className="loader">Loading questions...</div>
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
          <h1 className="form-page__title">Manage Questions</h1>
          <p className="form-page__sub">
            Click a topic to filter. Loaded {questions.length} questions
            {hasMore && ` (load more available)`}
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="topics-grid-section">
        <h3 className="section-title">Filter by Topic</h3>
        <div className="topics-grid">
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`topic-card ${selectedTopic?.id === topic.id ? 'topic-card--active' : ''}`}
              onClick={() => handleTopicClick(topic)}
            >
              <div 
                className="topic-card__bar" 
                style={{ background: `#${topic.color}` }}
              />
              <div className="topic-card__content">
                <span className="topic-card__title">{topic.title}</span>
                <span className="topic-card__count">
                  {questions.filter(q => q.topicId === topic.id).length} loaded
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active filter badge */}
      {selectedTopic && (
        <div className="active-filter">
          <span>Showing questions for: <strong>{selectedTopic.title}</strong></span>
          <button className="filter-clear-btn" onClick={clearFilter} title="Clear filter">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="search-wrap">
        <Search size={18} className="search-wrap__icon" />
        <input
          type="text"
          className="search-wrap__input"
          placeholder="Search all questions (min 2 chars)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isSearching}
        />
        <span className="search-wrap__count">
          {isSearching ? 'Searching...' : `${filteredQuestions.length} results`}
        </span>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__icon" style={{ color: '#ef4444' }}>
              <AlertCircle size={32} />
            </div>
            <h2 className="modal__title">Delete Question?</h2>
            <p className="modal__text">
              Soft delete: "<strong>{deleteConfirm.question.slice(0, 60)}…</strong>". It will be hidden but not permanently removed.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredQuestions.length === 0 ? (
        <div className="empty-state">
          <p>No questions found.</p>
        </div>
      ) : (
        <div className="manage-table">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map(question => (
                <tr key={question.id}>
                  <td>
                    <div className="table-cell-main">
                      <span>{question.question.slice(0, 80)}…</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-cell-tag">
                      <span className="topic-badge">{question.topicId}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="difficulty-badge"
                      style={{ background: getDifficultyColor(question.difficulty) }}
                    >
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="table-cell-num">{question.priority || 1}</td>
                  <td className="table-cell-date">
                    {question.createdAt
                      ? new Date(question.createdAt.toDate()).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="table-cell-actions">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => handleEdit(question.id)}
                      title="Edit question"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDeleteClick(question)}
                      title="Delete question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More button */}
      {hasMore && !selectedTopic && !search && (
        <div className="load-more-section">
          <button
            className="btn btn--ghost load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="btn-spinner" /> Loading...
              </>
            ) : (
              <>
                Load More Questions <ChevronDown size={16} />
              </>
            )}
          </button>
          <p className="load-more-hint">
            Showing {questions.length} questions. Click to load {QUESTIONS_PER_PAGE} more.
          </p>
        </div>
      )}
    </div>
  )
}
