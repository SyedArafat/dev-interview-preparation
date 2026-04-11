import { useState, useCallback } from 'react'

const STORAGE_KEY = 'dip_read_questions'

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  const isRead = useCallback(
    (questionId) => !!progress[questionId],
    [progress],
  )

  const toggleRead = useCallback((questionId) => {
    setProgress((prev) => {
      const next = { ...prev }
      if (next[questionId]) {
        delete next[questionId]
      } else {
        next[questionId] = true
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Returns { done, total } for a topic given its question list */
  const getTopicProgress = useCallback(
    (questions = []) => {
      const done = questions.filter((q) => progress[q.id]).length
      return { done, total: questions.length }
    },
    [progress],
  )

  return { isRead, toggleRead, getTopicProgress, progress }
}

