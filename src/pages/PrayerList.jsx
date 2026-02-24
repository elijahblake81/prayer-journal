// src/pages/PrayerList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PrayerCard from '../components/PrayerCard'
import MarkAnsweredModal from '../components/MarkAnsweredModal'

import { useAuth } from '../lib/AuthProvider'
import { subscribePrayers, savePrayer, removePrayer } from '../lib/firebase'

export default function PrayerList() {
  const { ready, user } = useAuth()
  const [prayers, setPrayers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')

  // ✅ Call the effect every render; guard inside the effect
  useEffect(() => {
    if (!ready || !user) return
    const off = subscribePrayers(user.uid, setPrayers)
    return () => off && off()
  }, [ready, user])

  const filtered = prayers.filter(p => {
    if (filter === 'open') return !p.answered
    if (filter === 'answered') return !!p.answered
    return true
  })

  const handleMarkAnswered = async (prayerId, answeredDate, notes) => {
    if (!user) return
    await savePrayer(user.uid, prayerId, { answered: { date: answeredDate, notes } })
    setEditingId(null)
  }

  const handleDelete = async (prayerId) => {
    if (!user) return
    await removePrayer(user.uid, prayerId)
  }

  const showSignIn = !ready || !user

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Prayers</h2>
        <Link to="/add" className="btn btn-primary">+ Add Prayer</Link>
      </div>

      {showSignIn ? (
        <div style={{padding:16}}>
          <p>Please sign in to view your prayers.</p>
        </div>
      ) : (
        <>
          <div className="filter-tabs">
            {['all', 'open', 'answered'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="prayer-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p>No prayers yet.</p>
                <Link to="/add" className="btn btn-primary">Add your first prayer</Link>
              </div>
            ) : (
              filtered.map(prayer => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onMarkAnswered={() => setEditingId(prayer.id)}
                  onDelete={() => handleDelete(prayer.id)}
                  
                />
              ))
            )}
          </div>

          {editingId && (
            <MarkAnsweredModal
              prayer={prayers.find(p => p.id === editingId)}
              onClose={() => setEditingId(null)}
              onSave={handleMarkAnswered}
            />
          )}
        </>
      )}
    </div>
  )
}