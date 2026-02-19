const STORAGE_KEY = 'prayer-journal-data'
const REMINDERS_KEY = 'prayer-journal-reminders'

export function loadPrayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePrayers(prayers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers))
}

export function loadReminders() {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY)
    return raw ? JSON.parse(raw) : { daily: null, weekly: null }
  } catch {
    return { daily: null, weekly: null }
  }
}

export function saveReminders(reminders) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
}
