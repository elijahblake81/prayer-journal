import { useState } from 'react'
import { format } from 'date-fns'

export default function MarkAnsweredModal({ prayer, onClose, onSave }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')

  if (!prayer) return null

  function handleSubmit(e) {
    e.preventDefault()
    onSave(prayer.id, date, notes.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Mark as Answered</h3>
        <p className="modal-preview">{prayer.content.slice(0, 100)}{prayer.content.length > 100 ? '...' : ''}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Date answered
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Notes <span className="hint">(optional)</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did God answer? Any reflections..."
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
