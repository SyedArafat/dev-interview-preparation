import { useState, useRef, useEffect, useCallback } from 'react'
import { Lock, StickyNote, ChevronDown, ChevronUp, Save, Loader2, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNote } from '../hooks/useNote'
import './NoteEditor.css'

export default function NoteEditor({ questionId }) {
  const { user, signInWithGoogle } = useAuth()
  const { content, setContent, loading, saving, saveNote, isDirty } = useNote(
    user?.uid ?? null,
    questionId,
  )

  const [open,    setOpen]    = useState(false)
  const [saved,   setSavedFx] = useState(false)  // brief "Saved ✓" flash
  const textareaRef           = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [content, open])

  const handleSave = useCallback(async () => {
    await saveNote(content)
    setSavedFx(true)
    setTimeout(() => setSavedFx(false), 2000)
  }, [saveNote, content])

  // Ctrl/Cmd + Enter to save
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className={`note-editor ${open ? 'note-editor--open' : ''}`}>
      {/* ── Toggle bar ── */}
      <button
        className="note-editor__toggle"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
      >
        <span className="note-editor__toggle-left">
          <StickyNote size={13} />
          <span>My Note</span>
          {!user && <span className="note-editor__login-hint">· sign in to use</span>}
          {user && !loading && content && !open && (
            <span className="note-editor__preview">
              {content.slice(0, 60)}{content.length > 60 ? '…' : ''}
            </span>
          )}
        </span>
        <span className="note-editor__toggle-right">
          {isDirty && open && <span className="note-editor__dot" aria-label="Unsaved changes" />}
          <Lock size={11} className="note-editor__lock" />
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* ── Body ── */}
      {open && (
        <div className="note-editor__body">
          {!user ? (
            /* ── Sign-in prompt ── */
            <div className="note-editor__signin">
              <Lock size={20} className="note-editor__signin-icon" />
              <p className="note-editor__signin-title">Private notes</p>
              <p className="note-editor__signin-sub">
                Sign in with Google to add your own notes to any question. Only you can see them.
              </p>
              <button className="note-editor__google-btn" onClick={signInWithGoogle}>
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>
          ) : loading ? (
            <div className="note-editor__loading">
              <Loader2 size={16} className="note-editor__spinner" />
            </div>
          ) : (
            /* ── Editor ── */
            <div className="note-editor__inner">
              <textarea
                ref={textareaRef}
                className="note-editor__textarea"
                placeholder={`Your private note…\n\nSupports plain text and code blocks:\n\`\`\`js\nconst x = 1\n\`\`\``}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                spellCheck={false}
              />
              <div className="note-editor__footer">
                <span className="note-editor__hint">
                  <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save
                </span>
                <button
                  className={`note-editor__save-btn ${saved ? 'note-editor__save-btn--saved' : ''}`}
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                >
                  {saving ? (
                    <><Loader2 size={13} className="note-editor__spinner" /> Saving…</>
                  ) : saved ? (
                    <><Check size={13} /> Saved</>
                  ) : (
                    <><Save size={13} /> Save note</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
