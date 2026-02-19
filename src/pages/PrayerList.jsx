import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPrayers, savePrayers } from '../lib/storage'
import { format, parseISO } from 'date-fns'
import PrayerCard from '../components/PrayerCard'
import MarkAnsweredModal from '../components/MarkAnsweredModal'

export default function PrayerList() {
  const [prayers, setPrayers] = useState(() => loadPrayers())
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all') // all, open, answered

  const filtered = prayers.filter(p => {
    if (filter === 'open') return !p.answered
    if (filter === 'answered') return p.answered
    return true
  })

  function refresh() {
    setPrayers(loadPrayers())
  }

  function handleMarkAnswered(prayerId, answeredDate, notes) {
    const updated = prayers.map(p =>
      p.id === prayerId
        ? { ...p, answered: { date: answeredDate, notes } }
        : p
    )
    savePrayers(updated)
    setPrayers(updated)
    setEditingId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Prayers</h2>
        <Link to="/add" className="btn btn-primary">+ Add Prayer</Link>
      </div>

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
              onRefresh={refresh}
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
    </div>
  )
}
