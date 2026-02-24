// src/pages/AddPrayer.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

// 🔹 New: auth + Firestore helpers
import { useAuth } from '../lib/AuthProvider'
import { addPrayer } from '../lib/firebase'

// Keep your original categories for the dropdown
const CATEGORIES = [
  'Thanksgiving',
  'Supplication',
  'Intercession',
  'Confession',
  'Worship',
  'Other',
]

export default function AddPrayer() {
  const navigate = useNavigate()

  // 🔹 New: read auth status
  const { ready, user } = useAuth()

  // Keep your original field structure so the UI looks identical
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scripture, setScripture] = useState('')

  // 🔹 Gate by auth (prevents odd flashes / errors)
  if (!ready) return null
  if (!user) return <div style={{ padding: 16 }}>Please sign in to add prayers.</div>

  // 🔹 New: Save to Firestore instead of localStorage
  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    await addPrayer(user.uid, {
      // We keep your field names to preserve look/feel.
      // The Firestore helper will set createdAt/updatedAt server timestamps too.
      content: content.trim(),
      category,
      scripture: scripture.trim() || '',
      tags,          // helper converts "a, b" -> ["a","b"]
      date,          // keep the user-selected date as a string (for display/filter)
      title: '',     // optional field (unused by this form, but supported)
    })

    navigate('/') // Prayers page will live-update via subscribePrayers
  }

  return (
    <div className="page">
      <h2>Add Prayer</h2>
      <form className="prayer-form" onSubmit={handleSubmit}>
        <label>
          Prayer
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your prayer here..."
            rows={6}
            required
          />
        </label>

        <div className="form-row">
          <label>
            Category
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </label>
        </div>

        <label>
          Tags <span className="hint">(comma-separated)</span>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. family, health, guidance"
          />
        </label>

        <label>
          Scripture <span className="hint">(optional)</span>
          <input
            type="text"
            value={scripture}
            onChange={e => setScripture(e.target.value)}
            placeholder="e.g. Philippians 4:6-7"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Prayer</button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
