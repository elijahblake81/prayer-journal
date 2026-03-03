// src/pages/PrayerList.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PrayerCard from '../components/PrayerCard'
import MarkAnsweredModal from '../components/MarkAnsweredModal'
import { useAuth } from '../lib/AuthProvider'
import { subscribePrayers, savePrayer, removePrayer } from '../lib/firebase'
import { useToast } from '../components/ToastProvider'

export default function PrayerList() {
  const { ready, user } = useAuth()
  const [prayers, setPrayers] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const showToast = useToast()

  // 🔹 subscribe to prayers
  useEffect(() => {
    if (!ready || !user) return

    setLoading(true)
    setError(null)

    const off = subscribePrayers(user.uid, items => {
      setPrayers(items)
      setLoading(false)
      if (editingId && !items.find(p => p.id === editingId)) {
        setEditingId(null)
      }
    })

    return () => off && off()
  }, [ready, user, editingId])

  // 🔹 handlers (OUTSIDE the effect)
  const handleUnmarkAnswered = async (prayerId) => {
    if (!user) return
    try {
      await savePrayer(user.uid, prayerId, { answered: false })
      showToast('Marked as open')
    } catch (err) {
      console.error('Failed to unmark answered:', err)
      showToast('Failed to mark as open', { duration: 3000 })
    }
  }

  const handleMarkAnswered = async (prayerId, answeredDate, notes) => {
    if (!user) return
    await savePrayer(user.uid, prayerId, { answered: { date: answeredDate, notes } })
    setEditingId(null)
    showToast('Marked as answered')
  }

  const handleDelete = async (prayerId) => {
    if (!user) return
    await removePrayer(user.uid, prayerId)
    showToast('Deleted')
  }

  const filtered = useMemo(() => {
    if (filter === 'open') return prayers.filter(p => !p.answered)
    if (filter === 'answered') return prayers.filter(p => !!p.answered)
    return prayers
  }, [prayers, filter])

  const showSignIn = !ready || !user
  const activePrayer = editingId ? prayers.find(p => p.id === editingId) : null

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Prayers</h2>
        <Link to="/add" className="btn btn-primary">+ Add Prayer</Link>
      </div>

      {showSignIn ? (
        <div style={{ padding: 16 }}>
          <p>Please sign in to view your prayers.</p>
        </div>
      ) : (
        <>
          <div className="filter-tabs" role="tablist" aria-label="Filter prayers">
            {['all', 'open', 'answered'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                role="tab"
                aria-selected={filter === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="empty-state" style={{ color: 'crimson' }}>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : (
            <div className="prayer-grid">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <p>No prayers {filter !== 'all' ? `in “${filter}”` : 'yet'}.</p>
                  <Link to="/add" className="btn btn-primary">Add your first prayer</Link>
                </div>
              ) : (
                filtered.map(prayer => (
                  <PrayerCard
                    key={prayer.id}
                    prayer={prayer}
                    onMarkAnswered={() => setEditingId(prayer.id)}
                    onUnmarkAnswered={() => handleUnmarkAnswered(prayer.id)}
                    onDelete={() => handleDelete(prayer.id)}
                  />
                ))
              )}
            </div>
          )}

          {activePrayer && (
            <MarkAnsweredModal
              prayer={activePrayer}
              onClose={() => setEditingId(null)}
              onSave={handleMarkAnswered}
            />
          )}
        </>
      )}
    </div>
  )
}