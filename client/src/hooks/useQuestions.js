import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useQuestions(topicId) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!topicId) return
    let cancelled = false

    async function fetch() {
      setLoading(true)
      try {
        const isActiveQuestion = (question) => question.deletedAt == null

        // Keep query on topicId only (no composite index dependency),
        // then enforce active-only results in memory.
        const q    = query(
          collection(db, 'questions'),
          where('topicId', '==', topicId),
        )
        const snap = await getDocs(q)
         const data = snap.docs.map(doc => {
           const docData = doc.data()
           return {
             id: doc.id,
             question: docData.question || '',
             difficulty: (docData.difficulty || 'intermediate').toLowerCase(),
             answer: docData.answer || '',
             ...docData,
           }
         })
         .filter(isActiveQuestion)
         // Sort by priority on client side
         data.sort((a, b) => (a.priority || 0) - (b.priority || 0))

        if (!cancelled) {
          setQuestions(data)
        }
      } catch (err) {
        console.error('Error fetching questions:', err.message, err.code)
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [topicId])

  return { questions, loading, error }
}
