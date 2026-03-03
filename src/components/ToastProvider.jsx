import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]) // [{ id, message }]

  const remove = useCallback(id => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  const show = useCallback((message, { duration = 2200 } = {}) => {
    const id = crypto.randomUUID()
    setToasts(ts => [...ts, { id, message }])
    // auto-remove
    setTimeout(() => remove(id), duration)
  }, [remove])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx.show
}