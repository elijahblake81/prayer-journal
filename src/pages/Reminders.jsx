import { useState, useEffect } from 'react'
import { loadReminders, saveReminders } from '../lib/storage'
import { requestNotificationPermission, showNotification } from '../lib/notifications'

export default function Reminders() {
  const [reminders, setReminders] = useState(() => loadReminders())
  const [daily, setDaily] = useState(reminders.daily || '')
  const [weekly, setWeekly] = useState(reminders.weekly || '')
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const check = async () => {
      const granted = await requestNotificationPermission()
      setPermission(Notification?.permission || 'default')
    }
    check()
  }, [])

  function handleSave() {
    const next = {
      daily: daily || null,
      weekly: weekly || null,
    }
    saveReminders(next)
    setReminders(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    const granted = await requestNotificationPermission()
    if (!granted) {
      alert('Please allow notifications in your browser settings.')
      return
    }
    showNotification('Prayer Reminder', {
      body: "Time to spend a moment in prayer.",
    })
  }

  return (
    <div className="page">
      <h2>Reminders</h2>

      {permission === 'denied' && (
        <div className="alert alert-warning">
          Notifications are blocked. Enable them in your browser settings to receive reminders.
        </div>
      )}

      {permission === 'default' && (
        <div className="alert alert-info">
          <p>Allow notifications to receive prayer reminders.</p>
          <button className="btn btn-sm btn-primary" onClick={handleTest}>
            Enable
          </button>
        </div>
      )}

      <div className="reminder-form">
        <label>
          Daily reminder
          <input
            type="time"
            value={daily}
            onChange={e => setDaily(e.target.value)}
          />
          <span className="hint">e.g. 7:00 AM</span>
        </label>
        <label>
          Weekly reminder
          <select
            value={weekly}
            onChange={e => setWeekly(e.target.value)}
          >
            <option value="">None</option>
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
          </select>
        </label>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Reminders'}
          </button>
          <button className="btn btn-ghost" onClick={handleTest}>
            Test Notification
          </button>
        </div>
      </div>

      <div className="reminder-info">
        <p>
          <strong>How it works:</strong> Reminders use your browser's notification system.
          Keep this tab open or use a pinned tab for reminders to fire. For best results,
          allow the site to run in the background.
        </p>
      </div>
    </div>
  )
}
