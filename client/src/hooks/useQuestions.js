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
        console.log('Fetching questions for topicId:', topicId)
        const q    = query(
          collection(db, 'questions'),
          where('topicId', '==', topicId),
        )
        const snap = await getDocs(q)
        console.log('Questions fetched:', snap.docs.length)
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
         // Filter out soft-deleted questions
         .filter(q => !q.deletedAt)
         // Sort by priority on client side
         data.sort((a, b) => (a.priority || 0) - (b.priority || 0))

        if (!cancelled) {
          console.log('Questions processed:', data)
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
