import { useEffect } from 'react'
import { loadReminders } from '../lib/storage'
import { showNotification } from '../lib/notifications'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const LAST_DAILY_KEY = 'prayer-last-daily'
const LAST_WEEKLY_KEY = 'prayer-last-weekly'

function shouldNotify(key, now) {
  const last = localStorage.getItem(key)
  const today = now.toDateString()
  if (last === today) return false
  localStorage.setItem(key, today)
  return true
}

export default function ReminderChecker() {
  useEffect(() => {
    const interval = setInterval(() => {
      const { daily, weekly } = loadReminders()
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const day = DAYS[now.getDay()]

      if (daily) {
        const [h, m] = daily.split(':').map(Number)
        if (hour === h && minute === m && shouldNotify(LAST_DAILY_KEY, now)) {
          showNotification('Prayer Reminder', { body: 'Time to spend a moment in prayer.' })
        }
      }
      if (weekly && weekly === day) {
        const [h, m] = (daily || '09:00').split(':').map(Number)
        if (hour === h && minute === m && shouldNotify(LAST_WEEKLY_KEY, now)) {
          showNotification('Weekly Prayer Reminder', { body: 'Take time for reflection and prayer this week.' })
        }
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return null
}
