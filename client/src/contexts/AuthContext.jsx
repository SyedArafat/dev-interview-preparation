import {createContext, useContext, useEffect, useState} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {doc, getDoc, serverTimestamp, setDoc} from 'firebase/firestore'
import {auth, db, googleProvider} from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const ref = doc(db, 'users', firebaseUser.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            setUserDoc(data)
            setRole(data.role || 'user')
          } else {
            // Auto-create profile for Google sign-in users
            const newDoc = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'user',
              createdAt: serverTimestamp(),
            }
            await setDoc(ref, newDoc)
            setUserDoc(newDoc)
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
  }, [])

  const signIn         = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signInWithGoogle = ()              => signInWithPopup(auth, googleProvider)
  const signOut        = ()                => firebaseSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, userDoc, role, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
