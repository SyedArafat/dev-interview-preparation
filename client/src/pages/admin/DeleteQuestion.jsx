import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function DeleteQuestion() {
  const navigate = useNavigate()
  const { questionId } = useParams()

  useEffect(() => {
    async function performDelete() {
      try {
        await runTransaction(db, async (transaction) => {
          const questionRef = doc(db, 'questions', questionId)
          const qSnap = await transaction.get(questionRef)
          if (!qSnap.exists()) return

          const qData = qSnap.data()
          const wasDeleted = Boolean(qData.deletedAt)
          if (wasDeleted) return

          let topicRef = null
          let topicSnap = null

          if (qData.topicId) {
            topicRef = doc(db, 'topics', qData.topicId)
            topicSnap = await transaction.get(topicRef)
          }

          transaction.update(questionRef, { deletedAt: serverTimestamp() })

          if (topicRef && topicSnap?.exists()) {
            const currentCount = Number(topicSnap.data().questionsCount || 0)
            transaction.update(topicRef, {
              questionsCount: Math.max(0, currentCount - 1),
            })
          }
        })

        // Redirect back to questions list
        navigate('/admin/questions', { replace: true })
      } catch {
        navigate('/admin/questions', { replace: true })
      }
    }
    performDelete()
  }, [questionId, navigate])

  return null
}

