import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            setUserDoc(data)
            setRole(data.role || 'user')
          } else {
            setUserDoc(null)
            setRole('user')
          }
        } catch {
          setUserDoc(null)
          setRole('user')
        }
      } else {
        setUser(null)
        setUserDoc(null)
        setRole(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn  = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signOut = ()                 => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, userDoc, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

