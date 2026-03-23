// src/pages/PublicFeed.jsx
import { useEffect, useState } from 'react'
import { subscribePublicPrayers } from '../lib/firebase'
import PublicPrayerCard from '../components/PublicPrayerCard'
import SwipeWrapper from "../components/SwipeWrapper";

export default function PublicFeed() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const off = subscribePublicPrayers(setItems, err => console.error(err))
    return () => off && off()
  }, [])

  return (
    <SwipeWrapper
    prev="/reflection"
    next="/"
    >
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
    </SwipeWrapper>
  )
}
