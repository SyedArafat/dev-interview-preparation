import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Fetches and saves a per-user note for a specific question.
 * Document ID pattern: `{userId}_{questionId}`
 */
export function useNote(userId, questionId) {
  const [content, setContent]   = useState('')
  const [saved,   setSaved]     = useState('')   // last persisted value
  const [loading, setLoading]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState(null)

  const noteId = userId && questionId ? `${userId}_${questionId}` : null

  // Load note on mount / when noteId changes
  useEffect(() => {
    if (!noteId) { setContent(''); setSaved(''); return }
    let cancelled = false
    setLoading(true)
    getDoc(doc(db, 'notes', noteId))
      .then(snap => {
        if (!cancelled) {
          const val = snap.exists() ? (snap.data().content || '') : ''
          setContent(val)
          setSaved(val)
        }
      })
      .catch(err => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [noteId])

  const saveNote = useCallback(async (text) => {
    if (!noteId) return
    setSaving(true)
    setError(null)
    try {
      await setDoc(doc(db, 'notes', noteId), {
        userId,
        questionId,
        content:   text,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setSaved(text)
      setContent(text)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }, [noteId, userId, questionId])

  const isDirty = content !== saved

  return { content, setContent, saved, loading, saving, error, saveNote, isDirty }
}

