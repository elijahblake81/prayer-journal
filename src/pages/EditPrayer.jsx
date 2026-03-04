// src/pages/EditPrayer.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../lib/AuthProvider'
import { getPrayerById, savePrayer, updatePublicFromPrivate } from '../lib/firebase'
import { useToast } from '../components/ToastProvider'

const CATEGORIES = [
  'Thanksgiving',
  'Supplication',
  'Intercession',
  'Confession',
  'Worship',
  'Other',
]

export default function EditPrayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ready, user } = useAuth()
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Same fields as AddPrayer.jsx:
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scripture, setScripture] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setError('Please sign in to edit prayers.')
      setLoading(false)
      return
    }

    let alive = true
    ;(async () => {
      try {
        const p = await getPrayerById(user.uid, id)
        if (!alive) return

        if (!p) {
          setError('Prayer not found.')
          setLoading(false)
          return
        }

        setContent(p.content || '')
        setCategory(p.category || CATEGORIES[0])
        setScripture(p.scripture || '')
        setDate(p.date || format(new Date(), 'yyyy-MM-dd'))
        setTags(Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''))

        setLoading(false)
      } catch (e) {
        console.error(e)
        setError('Failed to load prayer.')
        setLoading(false)
      }
    })()

    return () => { alive = false }
  }, [ready, user, id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await savePrayer(user.uid, id, {
        content: content.trim(),
        category,
        scripture: scripture.trim() || '',
        tags,   // savePrayer will normalize it
        date,   // keep string
      })

     // If this prayer is currently public, mirror the safe subset to publicPrayers
     if (prayer?.publicId) {
       // Build the same shape the UI shows (the private "prayer" state is current enough)
       const after = {
         ...prayer,
         content: content.trim(),
         category,
         scripture: scripture.trim() || '',
         tags,
         date,
       }
       await updatePublicPrayer(user.uid, prayer.publicId, after)
     }

      showToast('Updated!')
      navigate('/')
    } catch (e) {
      console.error(e)
      setError('Failed to update prayer.')
    }
  }

  if (!ready) return null
  if (loading) return <div className="page" style={{ padding: 16 }}>Loading…</div>
  if (error) return <div className="page" style={{ padding: 16, color: 'crimson' }}>{error}</div>

  return (
    <div className="page">
      <h2>Edit Prayer</h2>

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
              required
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
          <button type="submit" className="btn btn-primary">Update Prayer</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}