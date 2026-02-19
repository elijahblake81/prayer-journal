export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

export function showNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, {
    icon: '/prayer-journal/favicon.svg',
    ...options,
  })
}
