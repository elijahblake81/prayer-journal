import { format } from 'date-fns'
import { incrementPublicPrayedCount } from '../lib/firebase'
import { useState } from 'react'
import { useToast } from './ToastProvider'

function toJsDate(d) {
  if (!d) return null
  if (typeof d?.toDate === 'function') return d.toDate()
  if (typeof d === 'string') return new Date(d)
  if (d instanceof Date) return d
  return null
}

export default function PublicPrayerCard({ prayer }) {
  const [busy, setBusy] = useState(false)
  const { showToast } = useToast()

  const createdAt = toJsDate(prayer.createdAt)
  const lastPrayedAt = toJsDate(prayer.lastPrayedAt)


  // local optimistic count so UI updates immediately
  const [localCount, setLocalCount] = useState(Number(prayer?.prayedCount || 0))
  const count = localCount



  async function handlePrayed() {
    if (busy) return
    try {
      setBusy(true)
      setLocalCount(c => c + 1)                   // 👈 optimistic UI bump
      await incrementPublicPrayedCount(prayer.id) // 👈 public doc id from subscribePublicPrayers
      showToast('🙏 Counted—thank you for praying')
    } catch (e) {
      console.error('Failed to increment public prayed count', e)
      setLocalCount(c => Math.max(0, c - 1))      // rollback on error
      showToast('Could not record “Prayed”. Try again.', { duration: 3000 })
    } finally {
      setBusy(false)
    }
  }


  return (
    <article className="prayer-card">
      <div className="prayer-meta">
        <span className="category">{prayer?.category || 'General'}</span>
        {createdAt && <span className="date">{format(createdAt, 'MMM d, yyyy')}</span>}
      </div>

      <p className="prayer-content">{prayer?.content ?? ''}</p>

      {prayer?.scripture && <p className="scripture">"{prayer.scripture}"</p>}

      {Array.isArray(prayer?.tags) && prayer.tags.length > 0 && (
        <div className="tags">
          {prayer.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="answered-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="answered-badge">
          Prayed {count} {count === 1 ? 'time' : 'times'}
        </span>
        {lastPrayedAt && (
          <span className="answered-date">
            Last prayed {format(lastPrayedAt, 'MMM d, yyyy h:mm a')}
          </span>
        )}
      </div>

      <div className="card-actions">
        <button className="btn btn-sm btn-primary" onClick={handlePrayed} disabled={busy}>
          🙏 Prayed
        </button>
      </div>
    </article>
  )
}