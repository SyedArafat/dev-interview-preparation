import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
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
        const q    = query(
          collection(db, 'questions'),
          where('topicId', '==', topicId),
          orderBy('order'),
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        if (!cancelled) setQuestions(data)
      } catch (err) {
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
