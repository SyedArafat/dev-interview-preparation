import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTopics() {
  const [topics, setTopics]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        const snap   = await getDocs(collection(db, 'topics'))

        const data   = snap.docs.map(doc => {
          const docData = doc.data()
          return {
            ...docData,
            id: doc.id,
            name: docData.title || docData.name || '',
            title: docData.title || docData.name || '',
            category: docData.category || 'other',
            devicon: docData.icon || docData.devicon || '',
            color: docData.color ? (docData.color.startsWith('#') ? docData.color : `#${docData.color}`) : '#6366f1',
            questionsCount: docData.questionsCount || 0,
          }
        })
        // Filter out soft-deleted topics
        .filter(topic => !topic.deletedAt)
        if (!cancelled) {
          setTopics(data)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { topics, loading, error }
}
