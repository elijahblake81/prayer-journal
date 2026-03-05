// src/components/PrayerCard.jsx
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { useAuth } from '../lib/AuthProvider'
import { incrementPrayedCount } from '../lib/firebase'
import { useToast } from './ToastProvider'
import { publishPrayer, unpublishPrayer } from '../lib/firebase'

// NOTE: We no longer import localStorage helpers here.
// import { loadPrayers, savePrayers } from '../lib/storage'

export default function PrayerCard({ prayer, onMarkAnswered, onUnmarkAnswered, onDelete }) {
  const navigate = useNavigate()
  const isAnswered = !!prayer?.answered
  const [busy, setBusy] = useState(false) // optional local state to disable buttons during async actions
  const { user } = useAuth()
  const { showToast } = useToast()
  // Safe conversion for multiple shapes:
  // - Firestore Timestamp (has toDate())
  // - ISO string
  // - JS Date
  const toDate = (d) => {
    if (!d) return null
    if (typeof d?.toDate === 'function') return d.toDate() // Firestore Timestamp
    if (typeof d === 'string') return parseISO(d)          // ISO string
    if (d instanceof Date) return d                        // JS Date
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

  async function handleUnmarkClick() {
    if (!onUnmarkAnswered || busy) return
    try {
      setBusy(true)
      await onUnmarkAnswered()   // parent handles the save
    } finally {
      setBusy(false)
    }
  }

  
  async function handlePrayedClick() {
    if (!user || busy) return
    try {
      setBusy(true)
      await incrementPrayedCount(user.uid, prayer.id)
      showToast('🙏 Noted — praying with you')
    } catch (e) {
      console.error('Failed to increment prayed count', e)
      showToast('Could not record “Prayed”. Try again.', { duration: 3000 })
    } finally {
      setBusy(false)
    }
  }

  async function handlePublish() {
    if (!user || busy) return
    try {
      setBusy(true)
      await publishPrayer(user.uid, prayer)
      showToast('Shared to Public Prayers')
    } catch (e) {
      console.error('Publish failed', e)
      showToast('Could not publish. Try again.', { duration: 3000 })
    } finally {
      setBusy(false)
    }
  }

  async function handleUnpublish() {
    if (!user || busy) return
    try {
      setBusy(true)
      await unpublishPrayer(user.uid, prayer)
      toast('Unshared from Public Prayers')
    } catch (e) {
      console.error('Unpublish failed', e)
      toast('Could not unshare. Try again.', { duration: 3000 })
    } finally {
      setBusy(false)
    }
  }


  return (
    <article className={`prayer-card ${isAnswered ? 'answered' : ''}`}>
      <div className="prayer-meta">
        <span className="category">{prayer?.category || 'General'}</span>
        {createdAt && (
          <span className="date">{format(createdAt, 'MMM d, yyyy')}</span>
        )}


        {prayer?.publicId && (
          <span className="tag" title="This prayer is shared publicly">Public</span>
        )}


      </div>

      {/* Content (safe) */}
      <p className="prayer-content">{prayer?.content ?? ''}</p>


      {/* Prayed count + last prayed time */}
      <div className="tags" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="tag">
          Prayed {Number(prayer?.prayedCount || 0)} {Number(prayer?.prayedCount || 0) === 1 ? 'time' : 'times'}
        </span>
        {prayer?.lastPrayedAt && (
          <span className="date">
            Last prayed {format(
              typeof prayer.lastPrayedAt?.toDate === 'function' ? prayer.lastPrayedAt.toDate() : toDate(prayer.lastPrayedAt),
              'MMM d, yyyy h:mm a'
            )}
          </span>
        )}
      </div>


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
      
        <button className="btn btn-sm btn-primary" onClick={handlePrayedClick} disabled={busy}>
          🙏 Prayed
        </button>


        {!isAnswered && (
          <button className="btn btn-sm btn-accent" onClick={onMarkAnswered} disabled={busy}>
            Mark as Answered
          </button>
        )}

        {isAnswered && (
          <button className="btn btn-sm btn-ghost" onClick={handleUnmarkClick} disabled={busy}>
            Mark as open
          </button>
        )}


        {!prayer?.publicId ? (
          <button className="btn btn-sm btn-ghost" onClick={handlePublish} disabled={busy}>
            Make public
          </button>
        ) : (
          <button className="btn btn-sm btn-ghost" onClick={handleUnpublish} disabled={busy}>
            Unshare
          </button>
        )}



        
       {/* Edit = pencil */}
       <button
         className="btn-icon"
         onClick={() => navigate(`/prayers/${prayer.id}/edit`)}
         disabled={busy}
         aria-label="Edit"
         title="Edit"
       >
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
           <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
         </svg>
       </button>      
       {/* Delete = red X */}
       <button
         className="btn-icon danger"
         onClick={handleDelete}
         disabled={busy}
         aria-label="Delete"
         title="Delete"
       >
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
           <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 1 0-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z"/>
         </svg>
       </button>

      </div>
    </article>
  )
}
