// src/components/ReminderChecker.jsx
import { useEffect } from 'react'
import { loadReminders } from '../lib/storage'
import { showNotification } from '../lib/notifications'
import { useAuth } from '../lib/AuthProvider'

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
const LAST_DAILY_KEY = 'prayer-last-daily'
const LAST_WEEKLY_KEY = 'prayer-last-weekly'

function shouldNotify(key, now) {
  const last = localStorage.getItem(key)
  const today = now.toDateString()
  if (last === today) return false
  localStorage.setItem(key, today)
  return true
}

const parseTime = (t) => {
  const safe = String(t ?? '09:00')
  const [h, m] = safe.split(':')
  return [Number(h ?? 9), Number(m ?? 0)]
}

export default function ReminderChecker() {
  const { ready, user } = useAuth()

  // ✅ Always call the hook; check readiness inside the effect
  useEffect(() => {
    if (!ready) return
    // If you only want reminders for signed-in users, also guard:
    // if (!user) return

    const interval = setInterval(() => {
      const { daily, weekly } = loadReminders()
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const day = DAYS[now.getDay()]

      if (daily != null && daily !== '') {
        const [h, m] = parseTime(daily)
        if (hour === h && minute === m && shouldNotify(LAST_DAILY_KEY, now)) {
          showNotification('Prayer Reminder', { body: 'Time to spend a moment in prayer.' })
        }
      }

      if (weekly && weekly === day) {
        const [h, m] = parseTime(daily) // falls back to 09:00 safely
        if (hour === h && minute === m && shouldNotify(LAST_WEEKLY_KEY, now)) {
          showNotification('Weekly Prayer Reminder', { body: 'Take time for reflection and prayer this week.' })
        }
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [ready, user])

  return null
}