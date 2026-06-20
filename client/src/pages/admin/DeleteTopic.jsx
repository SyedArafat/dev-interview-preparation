import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function DeleteTopic() {
  const navigate = useNavigate()
  const { topicId } = useParams()

  useEffect(() => {
    async function performDelete() {
      try {
        await updateDoc(doc(db, 'topics', topicId), {
          deletedAt: serverTimestamp(),
        })
        // Redirect back to topics list
        navigate('/admin/topics', { replace: true })
      } catch {
        navigate('/admin/topics', { replace: true })
      }
    }
    performDelete()
  }, [topicId, navigate])

  return null
}

