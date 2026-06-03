import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, CheckCircle2, Palette, Eye } from 'lucide-react'
import { db } from '../../lib/firebase'
import './AddTopic.css'

const CATEGORIES = [
  { value: 'frontend',  label: 'Frontend' },
  { value: 'backend',   label: 'Backend' },
  { value: 'language',  label: 'Languages' },
  { value: 'database',  label: 'Database' },
  { value: 'devops',    label: 'DevOps' },
]


export default function EditTopic() {
  const navigate = useNavigate()
  const { topicId } = useParams()

  const [title,    setTitle]    = useState('')
  const [slug,     setSlug]     = useState('')
  const [category, setCategory] = useState('frontend')
  const [color,    setColor]    = useState('#6366f1')
  const [hexInput, setHexInput] = useState('6366f1')
  const [icon,     setIcon]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!topicId) return
    async function load() {
      try {
        setFetching(true)
        const docSnap = await getDoc(doc(db, 'topics', topicId))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setTitle(data.title || '')
          setSlug(topicId)
          setCategory(data.category || 'frontend')
          const colorHex = data.color && !data.color.startsWith('#') ? `#${data.color}` : data.color || '#6366f1'
          setColor(colorHex)
          setHexInput(colorHex.replace('#', ''))
          setIcon(data.icon || '')
        } else {
          setError('Topic not found.')
        }
      } catch (err) {
        setError(err.message || 'Failed to load topic.')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [topicId])

  function handleTitleChange(e) {
    const val = e.target.value
    setTitle(val)
    // Don't auto-update slug when editing — let user control it if needed
  }

  function handleColorPickerChange(e) {
    const hex = e.target.value
    setColor(hex)
    setHexInput(hex.replace('#', ''))
  }

  function handleHexInput(e) {
    const raw = e.target.value.replace('#', '').replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
    setHexInput(raw)
    if (raw.length === 3 || raw.length === 6) setColor(`#${raw}`)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim())    return setError('Title is required.')
    if (!icon.trim())     return setError('Icon class is required.')

    setLoading(true)
    try {
      await updateDoc(doc(db, 'topics', topicId), {
        title:      title.trim(),
        category,
        color:      hexInput || color.replace('#', ''),
        icon:       icon.trim(),
        updatedAt:  serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to update topic. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="form-page">
        <div className="loader">Loading topic...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page">
        <div className="form-success">
          <div className="form-success__icon"><CheckCircle2 size={44} /></div>
          <h2 className="form-success__title">Topic updated!</h2>
          <p className="form-success__sub">
            <strong>{title}</strong> has been updated in Firestore.
          </p>
          <div className="form-success__actions">
            <button className="btn btn--primary" onClick={() => navigate('/admin/topics')}>Back to topics</button>
            <button className="btn btn--ghost" onClick={() => navigate('/admin')}>Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-page__header">
        <button className="form-back-btn" onClick={() => navigate('/admin/topics')}>
          <ArrowLeft size={16} /> Manage Topics
        </button>
        <div>
          <p className="form-page__eyebrow">Content Management</p>
          <h1 className="form-page__title">Edit Topic</h1>
          <p className="form-page__sub">Update the topic details.</p>
        </div>
      </div>

      {error && <div className="form-error"><span>⚠</span>{error}</div>}

      <form className="topic-form" onSubmit={handleSubmit} noValidate>
        {/* Title & Slug */}
        <div className="form-section">
          <h3 className="form-section__title">Basic Info</h3>
          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title <span className="form-required">*</span>
              </label>
              <input
                id="title"
                className="form-input"
                type="text"
                placeholder="e.g. JavaScript"
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="slug">
                Document ID (slug) <span className="form-required">*</span>
              </label>
              <input
                id="slug"
                className="form-input form-input--mono"
                type="text"
                placeholder="e.g. javascript"
                value={slug}
                disabled
              />
              <p className="form-hint">Cannot be changed after creation.</p>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category <span className="form-required">*</span></label>
            <div className="category-pills">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`category-pill ${category === c.value ? 'category-pill--active' : ''}`}
                  onClick={() => setCategory(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="form-section">
          <h3 className="form-section__title">Appearance</h3>
          <div className="form-row form-row--2">
            {/* Color */}
            <div className="form-group">
              <label className="form-label">
                <Palette size={14} /> Brand Color <span className="form-required">*</span>
              </label>
              <div className="color-picker-wrap">
                <div className="color-preview" style={{ background: color }} />
                <input
                  type="color"
                  className="color-native"
                  value={color}
                  onChange={handleColorPickerChange}
                  title="Pick a color"
                />
                <span className="color-hash">#</span>
                <input
                  type="text"
                  className="form-input form-input--mono color-hex-input"
                  placeholder="6366f1"
                  value={hexInput}
                  onChange={handleHexInput}
                  maxLength={6}
                />
              </div>
              <p className="form-hint">Stored without the # prefix in Firestore.</p>
            </div>

            {/* Icon */}
            <div className="form-group">
              <label className="form-label">
                <Eye size={14} /> Devicon Class <span className="form-required">*</span>
              </label>
              <div className="icon-input-wrap">
                <input
                  className="form-input"
                  type="text"
                  placeholder="devicon-javascript-plain colored"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                />
                {icon && (
                  <div className="icon-preview">
                    <i className={icon} style={{ fontSize: '28px', color }} />
                  </div>
                )}
              </div>
              <p className="form-hint">
                Find classes on{' '}
                <a href="https://devicon.dev/" target="_blank" rel="noreferrer">devicon.dev</a>
              </p>
            </div>
          </div>

          {/* Live preview card */}
          {title && (
            <div className="topic-preview">
              <p className="topic-preview__label">Live preview</p>
              <div className="topic-preview__card" style={{ '--tc': color }}>
                <div className="topic-preview__bar" />
                <div className="topic-preview__icon">
                  {icon
                    ? <i className={icon} style={{ fontSize: '32px' }} />
                    : <span style={{ fontSize: '28px', color }}>?</span>
                  }
                </div>
                <span className="topic-preview__name">{title || 'Topic Name'}</span>
                <span className="topic-preview__cat">{category}</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/topics')}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Saving…</> : 'Update Topic'}
          </button>
        </div>
      </form>
    </div>
  )
}

