import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Fetches all non-empty notes for a given userId,
 * enriched with the question text and topicId.
 */
export function useUserNotes(userId) {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!userId) { setNotes([]); return }
    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        // 1. Fetch all note docs for this user
        const snap     = await getDocs(query(collection(db, 'notes'), where('userId', '==', userId)))
        if (cancelled) return

        const noteDocs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(n => n.content && n.content.trim())

        // 2. Fetch question metadata for each note (in parallel, max ~30 notes typical)
        const enriched = await Promise.all(
          noteDocs.map(async (n) => {
            try {
              const qSnap = await getDoc(doc(db, 'questions', n.questionId))
              const qData = qSnap.exists() ? qSnap.data() : {}
              return {
                ...n,
                questionText:  qData.question  || 'Unknown question',
                questionTopic: qData.topicId   || '',
                difficulty:    (qData.difficulty || '').toLowerCase(),
              }
            } catch {
              return { ...n, questionText: 'Unknown question', questionTopic: '', difficulty: '' }
            }
          })
        )

        if (!cancelled) setNotes(enriched)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  return { notes, loading, error }
}
