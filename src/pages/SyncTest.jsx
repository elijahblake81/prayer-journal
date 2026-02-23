// src/pages/SyncTest.jsx
import { useEffect, useState } from 'react'
import {
  signIn,
  signOutUser,
  onAuthChanged,
  subscribePrayers,
  addPrayer,
  savePrayer,
  removePrayer,
  handleRedirectResult,
} from '../lib/firebase' // path from pages → lib

export default function SyncTest() {
  const [user, setUser] = useState(null)
  const [prayers, setPrayers] = useState([])
  const [draft, setDraft] = useState('')


useEffect(() => {
    // If we used signInWithRedirect, this completes the sign-in
    handleRedirectResult().catch((err) => {
      // Optional: surface errors so we can see what's wrong
      if (err) {
        console.error('Redirect sign-in error:', err)
        alert(`Redirect sign-in error: ${err.code || ''} ${err.message || err}`)
      }
    })
  }, [])


  useEffect(() => {
    const unsubAuth = onAuthChanged((u) => {
      setUser(u)
      if (u) {
        const unsubData = subscribePrayers(u.uid, setPrayers)
        return () => unsubData()
      } else {
        setPrayers([])
      }
    })
    return () => unsubAuth && unsubAuth()
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '24px auto', padding: 16, border: '3px dashed #22c55e' }}>
      <h1 style={{ color: '#16a34a' }}>SYNC TEST PAGE</h1>

      <div style={{ margin: '12px 0' }}>
        {user ? (
          <>
            <div style={{ marginBottom: 8 }}>
              <strong>Signed in as:</strong> {user.email || user.uid}
            </div>
            <button onClick={signOutUser}>Sign out</button>
          </>
        ) : (
          <button onClick={signIn} style={{ padding: '8px 12px', fontSize: 16 }}>
            Sign in with Google
          </button>
        )}
      </div>

      {user && (
        <>
          <div style={{ marginTop: 16 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New prayer title"
              style={{ width: '75%', padding: 8 }}
            />
            <button
              onClick={async () => {
                if (draft.trim()) {
                  await addPrayer(user.uid, { title: draft.trim(), content: '' })
                  setDraft('')
                }
              }}
              style={{ marginLeft: 8 }}
            >
              Add
            </button>
          </div>

          <ul style={{ marginTop: 24, listStyle: 'none', padding: 0 }}>
            {prayers.map(p => (
              <li key={p.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <strong>{p.title}</strong>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => savePrayer(user.uid, p.id, { answered: !p.answered })}>
                    {p.answered ? 'Mark Unanswered' : 'Mark Answered'}
                  </button>
                  <button onClick={() => removePrayer(user.uid, p.id)} style={{ marginLeft: 8 }}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}