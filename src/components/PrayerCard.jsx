// src/components/PrayerCard.jsx
import { format, parseISO } from 'date-fns'

// NOTE: We no longer import localStorage helpers here.
// import { loadPrayers, savePrayers } from '../lib/storage'

export default function PrayerCard({ prayer, onMarkAnswered, onDelete }) {
  // Treat answered as "truthy" if it exists (object) or true (legacy)
  const isAnswered = !!prayer?.answered

  // Safe conversion for multiple shapes:
  // - Firestore Timestamp (has toDate())
  // - ISO string
  // - JS Date
  const toDate = (d) => {
    if (!d) return null
    if (typeof d?.toDate === 'function') return d.toDate()           // Firestore Timestamp
    if (typeof d === 'string')       return parseISO(d)               // ISO string
    if (d instanceof Date)           return d                         // JS Date
    return null
  }

  // Prefer Firestore fields; fall back to old localStorage field names
  const createdAt = toDate(prayer?.createdAt || prayer?.date)
  const answeredAt = toDate(prayer?.answered?.date)

  async function handleDelete() {
    if (!confirm('Delete this prayer?')) return
    // Defer deletion to the parent so it can call removePrayer(user.uid, id)
    if (onDelete) {
      await onDelete(prayer.id)
    }
    // If you want a *temporary* fallback to the old localStorage behavior,
    // uncomment this block. Otherwise, keep all deletes in Firestore.
    // const prayers = loadPrayers().filter(p => p.id !== prayer.id)
    // savePrayers(prayers)
  }

  return (
    <article className={`prayer-card ${isAnswered ? 'answered' : ''}`}>
      <div className="prayer-meta">
        <span className="category">{prayer?.category || 'General'}</span>
        {createdAt && (
          <span className="date">{format(createdAt, 'MMM d, yyyy')}</span>
        )}
      </div>

      {/* Content (safe) */}
      <p className="prayer-content">{prayer?.content ?? ''}</p>

      {/* Optional scripture */}
      {prayer?.scripture && (
        <p className="scripture">"{prayer.scripture}"</p>
      )}

      {/* Optional tags */}
      {Array.isArray(prayer?.tags) && prayer.tags.length > 0 && (
        <div className="tags">
          {prayer.tags.map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}

      {/* Answered block (safe render) */}
      {isAnswered && (
        <div className="answered-info">
          <span className="answered-badge">✓ Answered</span>
          {answeredAt && (
            <span className="answered-date">
              {format(answeredAt, 'MMM d, yyyy')}
            </span>
          )}
          {prayer?.answered?.notes && (
            <p className="answered-notes">{prayer.answered.notes}</p>
          )}
        </div>
      )}

      <div className="card-actions">
        {!isAnswered && (
          <button className="btn btn-sm btn-accent" onClick={onMarkAnswered}>
            Mark as Answered
          </button>
        )}
        <button className="btn btn-sm btn-ghost" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </article>
  )
}