// src/pages/PublicFeed.jsx
import { useEffect, useState } from 'react'
import { subscribePublicPrayers } from '../lib/firebase'
import PublicPrayerCard from '../components/PublicPrayerCard'

export default function PublicFeed() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const off = subscribePublicPrayers(setItems, err => console.error(err))
    return () => off && off()
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h2>Public Prayers</h2>
      </div>

      <div className="prayer-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No public prayers yet.</p>
          </div>
        ) : (
          items.map(prayer => <PublicPrayerCard key={prayer.id} prayer={prayer} />)
        )}
      </div>
    </div>
  )
}
