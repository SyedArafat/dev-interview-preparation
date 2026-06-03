import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { ArrowLeft, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { db } from '../../lib/firebase'
import './ManageTopics.css'

export default function ManageTopics() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [filteredTopics, setFilteredTopics] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadTopics()
  }, [])

  useEffect(() => {
    const filtered = topics.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
    )
    setFilteredTopics(filtered)
  }, [search, topics])

  async function loadTopics() {
    try {
      setLoading(true)
      const snap = await getDocs(
        query(collection(db, 'topics'), orderBy('title'))
      )
      const data = snap.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
        }))
        .filter(t => !t.deletedAt) // Hide soft-deleted topics
      setTopics(data)
      setFilteredTopics(data)
    } catch (err) {
      console.error('Error loading topics:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(topicId) {
    navigate(`/admin/topics/${topicId}/edit`)
  }

  function handleDeleteClick(topic) {
    setDeleteConfirm(topic)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    try {
      navigate(`/admin/topics/${deleteConfirm.id}/delete`)
    } catch (err) {
      console.error('Error deleting topic:', err)
    }
  }

  if (loading) {
    return (
      <div className="form-page form-page--wide">
        <div className="loader">Loading topics...</div>
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
          <h1 className="form-page__title">Manage Topics</h1>
          <p className="form-page__sub">View, edit, or delete all topics.</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <Search size={18} className="search-wrap__icon" />
        <input
          type="text"
          className="search-wrap__input"
          placeholder="Search by title, slug, or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="search-wrap__count">{filteredTopics.length} results</span>
      </div>

      {/* Lock confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__icon" style={{ color: '#ef4444' }}>
              <AlertCircle size={32} />
            </div>
            <h2 className="modal__title">Delete Topic?</h2>
            <p className="modal__text">
              Soft delete "<strong>{deleteConfirm.title}</strong>". It will be hidden but not permanently removed.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredTopics.length === 0 ? (
        <div className="empty-state">
          <p>No topics found.</p>
        </div>
      ) : (
        <div className="manage-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug (ID)</th>
                <th>Category</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map(topic => (
                <tr key={topic.id}>
                  <td>
                    <div className="table-cell-main">
                      <div className="table-cell-icon" style={{ background: `#${topic.color}` }} />
                      <span>{topic.title}</span>
                    </div>
                  </td>
                  <td><span className="table-cell-mono">{topic.id}</span></td>
                  <td>{topic.category || 'other'}</td>
                  <td className="table-cell-num">{topic.questionsCount || 0}</td>
                  <td className="table-cell-date">
                    {topic.createdAt
                      ? new Date(topic.createdAt.toDate()).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="table-cell-actions">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => handleEdit(topic.id)}
                      title="Edit topic"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDeleteClick(topic)}
                      title="Delete topic"
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

