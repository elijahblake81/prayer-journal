// src/lib/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const off = onAuthStateChanged(auth, u => {
      setUser(u || null)
      setReady(true)
    })
    return () => off()
  }, [])

  const signIn = () => signInWithPopup(auth, googleProvider)
  const signOutUser = () => signOut(auth)

  const value = { user, ready, signIn, signOut: signOutUser }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
