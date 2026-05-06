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
        console.log('Starting to fetch topics from Firestore...')
        const snap   = await getDocs(collection(db, 'topics'))
        console.log('Firestore response received, docs count:', snap.docs.length)
        
        const data   = snap.docs.map(doc => {
          const docData = doc.data()
          console.log('Processing doc:', doc.id, docData)
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
        if (!cancelled) {
          console.log('Topics fetched successfully:', data)
          setTopics(data)
        }
      } catch (err) {
        console.error('Error fetching topics:', err.message, err.code)
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
