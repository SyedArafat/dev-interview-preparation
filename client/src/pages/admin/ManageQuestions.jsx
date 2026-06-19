import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, limit, orderBy, startAfter, where, getCountFromServer } from 'firebase/firestore'
import { ArrowLeft, Search, Edit2, Trash2, AlertCircle, X, ChevronDown, RotateCcw } from 'lucide-react'
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
  const [totalCount, setTotalCount] = useState(0)

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

  async function loadQuestions(isInitial = false, topicId = null) {
    try {
      if (!isInitial) setLoadingMore(true)

      let q

      if (topicId) {
        // Topic-specific query: fetch ALL questions for that topic (no pagination)
        // Most topics won't have more than 100 questions anyway
        q = query(
          collection(db, 'questions'),
          where('topicId', '==', topicId)
        )
      } else {
        // All topics query: use pagination
        const constraints = [
          orderBy('topicId'),
          limit(QUESTIONS_PER_PAGE)
        ]

        if (!isInitial && lastDoc) {
          constraints.push(startAfter(lastDoc))
        }

        q = query(collection(db, 'questions'), ...constraints)
      }

      const snap = await getDocs(q)

      const newQuestions = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))

      // Sort client-side by priority
      newQuestions.sort((a, b) => (a.priority || 0) - (b.priority || 0))

      // Update state
      if (topicId) {
        // Topic-specific: replace all questions (no append)
        setQuestions(newQuestions)
        setHasMore(false) // No pagination for topic-specific queries
      } else {
        // All topics: append for pagination
        setQuestions(prev => isInitial ? newQuestions : [...prev, ...newQuestions])
        setLastDoc(snap.docs[snap.docs.length - 1] || null)
        setHasMore(snap.docs.length === QUESTIONS_PER_PAGE)
      }

      // Fetch total count for current filter
      if (isInitial) {
        await fetchTotalCount(topicId)
      }
    } catch (err) {
      console.error('Error loading questions:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  async function fetchTotalCount(topicId = null) {
    try {
      let countQuery
      if (topicId) {
        countQuery = query(
          collection(db, 'questions'),
          where('topicId', '==', topicId)
        )
      } else {
        countQuery = collection(db, 'questions')
      }

      const snapshot = await getCountFromServer(countQuery)
      setTotalCount(snapshot.data().count)
    } catch (err) {
      console.error('Error fetching count:', err)
      setTotalCount(0)
    }
  }

  async function performBackendSearch(searchTerm) {
    try {
      setIsSearching(true)

      // Build query with optional topic filter
      let constraints = []

      if (selectedTopic) {
        constraints.push(where('topicId', '==', selectedTopic.id))
      }

      const q = query(collection(db, 'questions'), ...constraints)
      const snap = await getDocs(q)

      const allQuestions = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))

      // Client-side text filter (Firestore doesn't support full-text search)
      const filtered = allQuestions.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topicId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
      )

      filtered.sort((a, b) => (a.priority || 0) - (b.priority || 0))
      setFilteredQuestions(filtered)

      const scope = selectedTopic ? `${selectedTopic.title} questions` : 'all questions'
      console.log(`Backend search for "${searchTerm}" in ${scope}:`, filtered.length, 'results')
    } catch (err) {
      console.error('Error searching questions:', err)
    } finally {
      setIsSearching(false)
    }
  }

  function handleLoadMore() {
    loadQuestions(false, selectedTopic?.id || null)
  }

  async function handleTopicClick(topic) {
    const newTopic = selectedTopic?.id === topic.id ? null : topic
    setSelectedTopic(newTopic)
    setSearch('') // Clear search when switching topics

    // Reset and load questions for the selected topic
    setQuestions([])
    setFilteredQuestions([])
    setLastDoc(null)
    setLoading(true)

    await loadQuestions(true, newTopic?.id || null)
    setLoading(false)

    const scope = newTopic ? newTopic.title : 'all topics'
    console.log(`Loaded questions for: ${scope}`)
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

  function handleRestoreClick(questionId) {
    navigate(`/admin/questions/${questionId}/restore`)
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
            {selectedTopic ? (
              <>
                Showing {questions.length} of {totalCount} {selectedTopic.title} questions
                {hasMore && ` • Load more available`}
              </>
            ) : (
              <>
                Showing {questions.length} of {totalCount} questions
                {hasMore && ` • Load more available`}
              </>
            )}
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
                  {topic.questionsCount || 0} questions
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
              Soft delete: &quot;<strong>{deleteConfirm.question.slice(0, 60)}…</strong>&quot;. It will be hidden but not permanently removed.
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
                <tr key={question.id} className={question.deletedAt ? 'row--deleted' : ''}>
                  <td>
                    <div className="table-cell-main">
                      <span className={question.deletedAt ? 'deleted-question-text' : ''}>{question.question.slice(0, 80)}…</span>
                      {question.deletedAt && <span className="status-badge status-badge--deleted">Deleted</span>}
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
                    {question.deletedAt ? (
                      <button
                        className="action-btn action-btn--restore"
                        onClick={() => handleRestoreClick(question.id)}
                        title="Restore question"
                      >
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteClick(question)}
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More button */}
      {hasMore && !search && (
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
            Showing {questions.length} of {totalCount} {selectedTopic ? selectedTopic.title : ''} questions
          </p>
        </div>
      )}
    </div>
  )
}
