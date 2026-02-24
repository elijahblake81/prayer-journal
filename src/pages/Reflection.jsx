// src/pages/Reflection.jsx
import { useEffect, useMemo, useState } from 'react'
import { format, parseISO, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import PrayerCard from '../components/PrayerCard'

import { useAuth } from '../lib/AuthProvider'
import { subscribePrayers, removePrayer, savePrayer } from '../lib/firebase'

export default function Reflection() {
  const { ready, user } = useAuth()
  const [prayers, setPrayers] = useState([])

  // Always call the hook; guard inside the effect
  useEffect(() => {
    if (!ready || !user) return
    const off = subscribePrayers(user.uid, setPrayers)
    return () => off && off()
  }, [ready, user])

  // Helper that accepts Firestore Timestamp, ISO string, or Date
  const toDate = (d) => {
    if (!d) return null
    if (typeof d?.toDate === 'function') return d.toDate()   // Firestore Timestamp
    if (typeof d === 'string')            return parseISO(d) // Legacy ISO string
    if (d instanceof Date)                return d
    return null
  }

  // Build the two reflection datasets from the live list
  const { last7Days, answeredThisMonth } = useMemo(() => {
    const now        = new Date()
    const sevenAgo   = subDays(now, 7)
    const monthStart = startOfMonth(now)
    const monthEnd   = endOfMonth(now)

    // Items added in the last 7 days and not answered
    const last7 = prayers
      .filter(p => {
        const created = toDate(p.createdAt || p.date)
        if (!created) return false
        return created >= sevenAgo && !p.answered
      })
      .sort((a, b) => {
        const da = toDate(a.createdAt || a.date) || new Date(0)
        const db = toDate(b.createdAt || b.date) || new Date(0)
        return db - da
      })

    // Answered this month (answered.date within current month)
    const answered = prayers
      .filter(p => {
        const ad = toDate(p.answered?.date)
        if (!ad) return false
        return isWithinInterval(ad, { start: monthStart, end: monthEnd })
      })
      .sort((a, b) => {
        const da = toDate(a.answered?.date) || new Date(0)
        const db = toDate(b.answered?.date) || new Date(0)
        return db - da
      })

    return { last7Days: last7, answeredThisMonth: answered }
  }, [prayers])

  if (!ready) return null
  if (!user)  return <div className="page" style={{padding:16}}>Please sign in to view reflections.</div>

  // Optional: actions if you want them in this page too
  const handleDelete = async (id) => removePrayer(user.uid, id)
  const handleMarkAnswered = async (id, date, notes) =>
    savePrayer(user.uid, id, { answered: { date, notes } })

  return (
    <div className="page">
      <h2>Reflection</h2>

      <section className="reflection-section">
        <h3>Past 7 Days</h3>
        <p className="section-desc">Prayers you've added in the last week</p>

        {last7Days.length === 0 ? (
          <p className="empty-message">No prayers in the past 7 days.</p>
        ) : (
          <div className="prayer-grid compact">
            {last7Days.map(p => (
              <PrayerCard
                key={p.id}
                prayer={p}
                onMarkAnswered={() => {/* open your modal here if desired */}}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="reflection-section">
        <h3>Answered This Month</h3>
        <p className="section-desc">
          Prayers God answered in {format(new Date(), 'MMMM yyyy')}
        </p>

        {answeredThisMonth.length === 0 ? (
          <p className="empty-message">No answered prayers this month yet.</p>
        ) : (
          <div className="prayer-grid compact">
            {answeredThisMonth.map(p => (
              <PrayerCard
                key={p.id}
                prayer={p}
                onMarkAnswered={() => {/* open your modal here if desired */}}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}