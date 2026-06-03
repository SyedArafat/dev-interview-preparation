import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function DeleteQuestion() {
  const navigate = useNavigate()
  const { questionId } = useParams()

  useEffect(() => {
    async function performDelete() {
      try {
        // Get the question to find its topicId
        const qSnap = await getDoc(doc(db, 'questions', questionId))
        if (qSnap.exists()) {
          const qData = qSnap.data()

          // Soft delete the question
          await updateDoc(doc(db, 'questions', questionId), {
            deletedAt: serverTimestamp(),
          })

          // Decrement the questionsCount on the topic
          if (qData.topicId) {
            await updateDoc(doc(db, 'topics', qData.topicId), {
              questionsCount: increment(-1),
            })
          }
        }
        // Redirect back to questions list
        navigate('/admin/questions', { replace: true })
      } catch (err) {
        console.error('Error deleting question:', err)
        navigate('/admin/questions', { replace: true })
      }
    }
    performDelete()
  }, [questionId, navigate])

  return null
}

