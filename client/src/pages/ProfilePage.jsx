import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Calendar, Edit3, Check, X, Camera,
  StickyNote, BookOpen, ChevronRight, Loader2,
  LogOut, ArrowLeft, FileText, Hash,
} from 'lucide-react'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useUserNotes } from '../hooks/useUserNotes'
import Header from '../components/Header'
import './ProfilePage.css'

const DIFF_COLOR = {
  beginner:     { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  intermediate: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  advanced:     { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
}

function EditableField({ label, icon: Icon, value, onSave, placeholder }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { setDraft(value) }, [value])

  async function handleSave() {
    if (draft.trim() === value) { setEditing(false); return }
    setSaving(true)
    await onSave(draft.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="profile-field">
      <span className="profile-field__label"><Icon size={13} />{label}</span>
      {editing ? (
        <div className="profile-field__edit-row">
          <input
            ref={inputRef}
            className="profile-field__input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            }}
          />
          <button className="profile-field__action profile-field__action--save" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
          </button>
          <button className="profile-field__action profile-field__action--cancel" onClick={() => { setDraft(value); setEditing(false) }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="profile-field__view-row">
          <span className="profile-field__value">
            {value || <span className="profile-field__empty">{placeholder}</span>}
          </span>
          <button className="profile-field__edit-btn" onClick={() => setEditing(true)}><Edit3 size={12} /></button>
        </div>
      )}
    </div>
  )
}

function AvatarSection({ user, onUpdatePhoto }) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(user.photoURL || '')
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)
  const initials = (user.displayName || user.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleSave() {
    setSaving(true)
    await onUpdatePhoto(url.trim())
    setSaving(false)
    setEditing(false)
    setImgError(false)
  }

  return (
    <div className="profile-avatar-section">
      <div className="profile-avatar-wrap">
        {user.photoURL && !imgError
          ? <img src={user.photoURL} alt="avatar" className="profile-avatar" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
          : <div className="profile-avatar profile-avatar--initials">{initials}</div>
        }
        <button className="profile-avatar-edit-btn" onClick={() => setEditing(p => !p)} title="Change photo">
          <Camera size={14} />
        </button>
      </div>
      {editing && (
        <div className="profile-avatar-url-form">
          <input
            className="profile-field__input"
            placeholder="Paste image URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
          <div className="profile-avatar-url-btns">
            <button className="profile-field__action profile-field__action--save" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
              <span>Apply</span>
            </button>
            <button className="profile-field__action profile-field__action--cancel" onClick={() => setEditing(false)}>
              <X size={13} />
            </button>
          </div>
          <p className="profile-avatar-hint">Paste any public image URL. Your Google photo is used by default.</p>
        </div>
      )}
    </div>
  )
}

function NoteCard({ note }) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFF_COLOR[note.difficulty] || {}
  const hasMore = note.content.length > 140

  return (
    <div className="note-card">
      <div className="note-card__header">
        <div className="note-card__meta">
          {note.questionTopic && (
            <Link to={`/topic/${note.questionTopic}`} className="note-card__topic-badge">
              <Hash size={10} />{note.questionTopic}
            </Link>
          )}
          {note.difficulty && (
            <span className="note-card__diff" style={{ background: diff.bg, color: diff.color }}>
              {note.difficulty}
            </span>
          )}
        </div>
        <Link to={`/topic/${note.questionTopic}`} className="note-card__question">
          <FileText size={12} />
          {note.questionText}
          <ChevronRight size={12} className="note-card__arrow" />
        </Link>
      </div>
      <div className="note-card__body">
        <pre className="note-card__content">
          {expanded || !hasMore ? note.content : `${note.content.slice(0, 140)}...`}
        </pre>
        {hasMore && (
          <button className="note-card__expand" onClick={() => setExpanded(p => !p)}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, userDoc, signOut, loading: authLoading } = useAuth()
  const { notes, loading: notesLoading } = useUserNotes(user?.uid)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notes')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  if (authLoading || !user) return (
    <div className="profile-page">
      <Header />
      <div className="profile-loading"><Loader2 size={24} className="spin" /></div>
    </div>
  )

  async function handleUpdateName(newName) {
    setSaveError('')
    try {
      await updateProfile(auth.currentUser, { displayName: newName })
      await updateDoc(doc(db, 'users', user.uid), { displayName: newName, updatedAt: serverTimestamp() })
    } catch (err) { setSaveError(err.message) }
  }

  async function handleUpdatePhoto(newUrl) {
    setSaveError('')
    try {
      await updateProfile(auth.currentUser, { photoURL: newUrl })
      await updateDoc(doc(db, 'users', user.uid), { photoURL: newUrl, updatedAt: serverTimestamp() })
    } catch (err) { setSaveError(err.message) }
  }

  const joinDate = userDoc?.createdAt?.toDate
    ? userDoc.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Member'

  const doneCount = Object.keys(JSON.parse(localStorage.getItem('dip_read_questions') || '{}')).length

  return (
    <div className="profile-page">
      <Header />
      <main className="container profile-main">
        <button className="back-btn profile-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <AvatarSection user={user} onUpdatePhoto={handleUpdatePhoto} />
            <div className="profile-identity">
              <h1 className="profile-name">{user.displayName || 'Your Name'}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat__val">{notes.length}</span>
                <span className="profile-stat__label">Notes</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat">
                <span className="profile-stat__val">{doneCount}</span>
                <span className="profile-stat__label">Done</span>
              </div>
            </div>
            <div className="profile-fields">
              <EditableField
                label="Display name" icon={User}
                value={user.displayName || ''}
                onSave={handleUpdateName}
                placeholder="Add your name..."
              />
              <div className="profile-field">
                <span className="profile-field__label"><Mail size={13} />Email</span>
                <div className="profile-field__view-row">
                  <span className="profile-field__value profile-field__value--muted">{user.email}</span>
                </div>
              </div>
              <div className="profile-field">
                <span className="profile-field__label"><Calendar size={13} />Joined</span>
                <div className="profile-field__view-row">
                  <span className="profile-field__value profile-field__value--muted">{joinDate}</span>
                </div>
              </div>
            </div>
            {saveError && <p className="profile-error">{saveError}</p>}
            <button className="profile-signout-btn" onClick={() => { signOut(); navigate('/') }}>
              <LogOut size={14} />Sign out
            </button>
          </aside>

          <div className="profile-content">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'notes' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <StickyNote size={14} />My Notes
                <span className="profile-tab__count">{notes.length}</span>
              </button>
              <button
                className={`profile-tab ${activeTab === 'topics' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('topics')}
              >
                <BookOpen size={14} />Topics
              </button>
            </div>

            {activeTab === 'notes' && (
              notesLoading
                ? <div className="profile-tab-loading"><Loader2 size={20} className="spin" /><span>Loading notes...</span></div>
                : notes.length === 0
                  ? (
                    <div className="profile-empty">
                      <StickyNote size={32} className="profile-empty__icon" />
                      <p className="profile-empty__title">No notes yet</p>
                      <p className="profile-empty__sub">Open any question and click <strong>My Note</strong> to start.</p>
                      <Link to="/" className="profile-empty__cta">Browse topics →</Link>
                    </div>
                  )
                  : (
                    <div className="profile-notes-list">
                      {notes.map(note => <NoteCard key={note.id} note={note} />)}
                    </div>
                  )
            )}

            {activeTab === 'topics' && (
              <div className="profile-empty">
                <BookOpen size={32} className="profile-empty__icon" />
                <p className="profile-empty__title">Topic progress</p>
                <p className="profile-empty__sub">Your per-topic completion stats will appear here soon.</p>
                <Link to="/" className="profile-empty__cta">Browse topics →</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

