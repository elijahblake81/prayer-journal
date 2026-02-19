import { useMemo, useState } from 'react'
import { loadPrayers } from '../lib/storage'
import { format, parseISO, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import PrayerCard from '../components/PrayerCard'

export default function Reflection() {
  const [refresh, setRefresh] = useState(0)
  const { last7Days, answeredThisMonth } = useMemo(() => {
    const prayers = loadPrayers()
    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const last7 = prayers.filter(p => {
      const d = parseISO(p.date)
      return d >= sevenDaysAgo && !p.answered
    }).sort((a, b) => new Date(b.date) - new Date(a.date))

    const answered = prayers.filter(p => {
      if (!p.answered) return false
      const d = parseISO(p.answered.date)
      return isWithinInterval(d, { start: monthStart, end: monthEnd })
    }).sort((a, b) => new Date(b.answered.date) - new Date(a.answered.date))

    return { last7Days: last7, answeredThisMonth: answered }
  }, [refresh])

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
              <PrayerCard key={p.id} prayer={p} onMarkAnswered={() => {}} onRefresh={() => setRefresh(r => r + 1)} />
            ))}
          </div>
        )}
      </section>

      <section className="reflection-section">
        <h3>Answered This Month</h3>
        <p className="section-desc">Prayers God answered in {format(new Date(), 'MMMM yyyy')}</p>
        {answeredThisMonth.length === 0 ? (
          <p className="empty-message">No answered prayers this month yet.</p>
        ) : (
          <div className="prayer-grid compact">
            {answeredThisMonth.map(p => (
              <PrayerCard key={p.id} prayer={p} onMarkAnswered={() => {}} onRefresh={() => setRefresh(r => r + 1)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
