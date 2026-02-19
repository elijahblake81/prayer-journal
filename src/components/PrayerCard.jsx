import { format, parseISO } from 'date-fns'
import { loadPrayers, savePrayers } from '../lib/storage'

export default function PrayerCard({ prayer, onMarkAnswered, onRefresh }) {
  const isAnswered = !!prayer.answered

  function handleDelete() {
    if (!confirm('Delete this prayer?')) return
    const prayers = loadPrayers().filter(p => p.id !== prayer.id)
    savePrayers(prayers)
    onRefresh()
  }

  return (
    <article className={`prayer-card ${isAnswered ? 'answered' : ''}`}>
      <div className="prayer-meta">
        <span className="category">{prayer.category}</span>
        <span className="date">{format(parseISO(prayer.date), 'MMM d, yyyy')}</span>
      </div>
      <p className="prayer-content">{prayer.content}</p>
      {prayer.scripture && (
        <p className="scripture">"{prayer.scripture}"</p>
      )}
      {prayer.tags?.length > 0 && (
        <div className="tags">
          {prayer.tags.map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}
      {isAnswered && prayer.answered && (
        <div className="answered-info">
          <span className="answered-badge">✓ Answered</span>
          <span className="answered-date">
            {format(parseISO(prayer.answered.date), 'MMM d, yyyy')}
          </span>
          {prayer.answered.notes && (
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
