import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { ArrowLeft, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { db } from '../../lib/firebase'
import './ManageQuestions.css'

export default function ManageQuestions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    const filtered = questions.filter(q =>
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.topicId.toLowerCase().includes(search.toLowerCase()) ||
      q.difficulty.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredQuestions(filtered)
  }, [search, questions])

  async function loadQuestions() {
    try {
      setLoading(true)
      const snap = await getDocs(
        query(collection(db, 'questions'), orderBy('topicId'), orderBy('priority'))
      )
      const data = snap.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
        }))
        .filter(q => !q.deletedAt) // Hide soft-deleted questions
      setQuestions(data)
      setFilteredQuestions(data)
    } catch (err) {
      console.error('Error loading questions:', err)
    } finally {
      setLoading(false)
    }
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
          <p className="form-page__sub">View, edit, or delete all questions.</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <Search size={18} className="search-wrap__icon" />
        <input
          type="text"
          className="search-wrap__input"
          placeholder="Search by question, topic, or difficulty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="search-wrap__count">{filteredQuestions.length} results</span>
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
    </div>
  )
}

