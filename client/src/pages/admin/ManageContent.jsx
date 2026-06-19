import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { ArrowLeft, Search, Edit2, Trash2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { db } from '../../lib/firebase'
import './ManageContent.css'

export default function ManageContent() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [allQuestions, setAllQuestions] = useState([])
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [topicsSnap, questionsSnap] = await Promise.all([
        getDocs(query(collection(db, 'topics'), orderBy('title'))),
        getDocs(collection(db, 'questions')) // No orderBy - sort client-side
      ])
      
      const topicsData = topicsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(t => !t.deletedAt)
      
      const questionsData = questionsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(q => !q.deletedAt)
      
      setTopics(topicsData)
      setAllQuestions(questionsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  function getTopicQuestions(topicId) {
    return allQuestions
      .filter(q => q.topicId === topicId)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Client-side sort
  }

  function toggleTopic(topicId) {
    setExpandedTopic(expandedTopic === topicId ? null : topicId)
  }

  function handleEditTopic(topicId) {
    navigate(`/admin/topics/${topicId}/edit`)
  }

  function handleDeleteTopic(topic) {
    setDeleteConfirm({ type: 'topic', item: topic })
  }

  function handleEditQuestion(questionId) {
    navigate(`/admin/questions/${questionId}/edit`)
  }

  function handleDeleteQuestion(question) {
    setDeleteConfirm({ type: 'question', item: question })
  }

  function confirmDelete() {
    if (!deleteConfirm) return
    if (deleteConfirm.type === 'topic') {
      navigate(`/admin/topics/${deleteConfirm.item.id}/delete`)
    } else {
      navigate(`/admin/questions/${deleteConfirm.item.id}/delete`)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#10b981'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const filteredTopics = topics.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="form-page form-page--wide">
        <div className="loader">Loading content...</div>
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
          <h1 className="form-page__title">Manage Topics & Questions</h1>
          <p className="form-page__sub">Click topic to view/edit questions.</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <Search size={18} className="search-wrap__icon" />
        <input
          type="text"
          className="search-wrap__input"
          placeholder="Search topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="search-wrap__count">{filteredTopics.length} topics</span>
      </div>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-delete-modal-title"
            aria-describedby="content-delete-modal-description"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal__icon" style={{ color: '#ef4444' }}>
              <AlertCircle size={32} />
            </div>
            <h2 className="modal__title" id="content-delete-modal-title">Delete {deleteConfirm.type}?</h2>
            <p className="modal__text" id="content-delete-modal-description">
              Soft delete "<strong>
                {deleteConfirm.type === 'topic'
                  ? deleteConfirm.item.title
                  : deleteConfirm.item.question?.slice(0, 60)}
              </strong>". Hidden but not permanently removed.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Topics list */}
      {filteredTopics.length === 0 ? (
        <div className="empty-state">
          <p>No topics found.</p>
        </div>
      ) : (
        <div className="content-list">
          {filteredTopics.map(topic => {
            const questions = getTopicQuestions(topic.id)
            const isExpanded = expandedTopic === topic.id

            return (
              <div key={topic.id} className="content-item">
                {/* Topic row */}
                <div className="topic-row">
                  <button
                    className="topic-expand-btn"
                    onClick={() => toggleTopic(topic.id)}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div className="topic-info" onClick={() => toggleTopic(topic.id)}>
                    <div className="topic-icon" style={{ background: `#${topic.color}` }} />
                    <div className="topic-details">
                      <span className="topic-title">{topic.title}</span>
                      <span className="topic-meta">
                        {topic.id} • {topic.category || 'other'} • {questions.length} questions
                      </span>
                    </div>
                  </div>

                  <div className="topic-actions">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => handleEditTopic(topic.id)}
                      title="Edit topic"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDeleteTopic(topic)}
                      title="Delete topic"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Questions table (expanded) */}
                {isExpanded && (
                  <div className="questions-panel">
                    {questions.length === 0 ? (
                      <div className="empty-questions">
                        No questions yet. <a href={`/admin/questions/new`}>Add one</a>
                      </div>
                    ) : (
                      <table className="questions-table">
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th>Difficulty</th>
                            <th>Priority</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {questions.map(q => (
                            <tr key={q.id}>
                              <td className="q-text">{q.question}</td>
                              <td>
                                <span
                                  className="difficulty-badge"
                                  style={{ background: getDifficultyColor(q.difficulty) }}
                                >
                                  {q.difficulty}
                                </span>
                              </td>
                              <td className="q-priority">{q.priority || 1}</td>
                              <td className="q-actions">
                                <button
                                  className="action-btn action-btn--edit"
                                  onClick={() => handleEditQuestion(q.id)}
                                  title="Edit question"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="action-btn action-btn--delete"
                                  onClick={() => handleDeleteQuestion(q)}
                                  title="Delete question"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

