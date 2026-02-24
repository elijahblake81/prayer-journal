// src/lib/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthChanged, signIn as firebaseSignIn, signOutUser, handleRedirectResult } from './firebase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)


useEffect(() => {
  // In case iOS standalone used redirect flow, resolve it first (no-op otherwise)
  handleRedirectResult?.().finally(() => {
    const off = onAuthChanged(u => {
      setUser(u || null)
      setReady(true)
    })
    return () => off()
  })
}, [])


  const signIn  = () => firebaseSignIn()
  const signOut = () => signOutUser()   

  const value = { user, ready, signIn, signOut }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
