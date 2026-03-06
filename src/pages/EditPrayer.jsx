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
  //const { showToast } = useToast()              // correct API shape

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)   // error during initial load
  const [submitError, setSubmitError] = useState(null)   // error during submit

  // Keep original doc so we know publicId, etc.
  const [prayerDoc, setPrayerDoc] = useState(null)

  // Form state
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scripture, setScripture] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setLoadError('Please sign in to edit prayers.')
      setLoading(false)
      return
    }

    let alive = true
      ; (async () => {
        try {
          const p = await getPrayerById(user.uid, id)
          if (!alive) return

          if (!p) {
            setLoadError('Prayer not found.')
            setLoading(false)
            return
          }

          setPrayerDoc(p)
          setContent(p.content || '')
          setCategory(p.category || CATEGORIES[0])
          setScripture(p.scripture || '')
          setDate(p.date || format(new Date(), 'yyyy-MM-dd'))
          setTags(Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''))

          setLoading(false)
        } catch (e) {
          console.error('Load prayer failed:', e)
          setLoadError('Failed to load prayer.')
          setLoading(false)
        }
      })()

    return () => { alive = false }
  }, [ready, user, id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    if (!content.trim()) {
     // showToast('Please enter a prayer before saving.', { variant: 'warning' })
      return
    }

    setSubmitError(null)
    setSaving(true)

    // 1) Save the private doc (authoritative) — ONLY this is in the main try/catch
    try {
      await savePrayer(user.uid, id, {
        content: content.trim(),
        category,
        scripture: scripture.trim() || '',
        tags,   // savePrayer normalizes string -> array
        date,   // keep string
      })
    } catch (e) {
      console.error('Private save failed:', e)
      setSubmitError('Failed to update prayer.')  // show banner only if the core save failed
      setSaving(false)
      return
    }

    // 2) Mirror to /publicPrayers (best-effort, never blocks success)
    if (prayerDoc?.publicId) {
      const after = {
        ...prayerDoc,
        content: content.trim(),
        category,
        scripture: scripture.trim() || '',
        tags,   // string or array OK; helper normalizes
        date,
      }
      try {
        await updatePublicFromPrivate(user.uid, after)
      } catch (mirrorErr) {
        console.error('Mirror update failed:', mirrorErr)
        showToast('Updated, but could not sync the public copy yet.', { variant: 'warning' })
      }
    }

    // 3) Celebrate and leave the page
    //showToast('Updated!')
    setSaving(false)
    navigate('/')
  }

  if (!ready) return null
  if (loading) return <div className="page" style={{ padding: 16 }}>Loading…</div>
  if (loadError) return <div className="page" style={{ padding: 16, color: 'crimson' }}>{loadError}</div>

  return (
    <div className="page">
      <h2>Edit Prayer</h2>

      {/* Submit error appears only if the core private save failed */}
      {submitError && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>{submitError}</div>
      )}

      <form className="prayer-form" onSubmit={handleSubmit}>
        <label>
          Prayer
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your prayer here..."
            rows={6}
            required
            disabled={saving}
          />
        </label>

        <div className="form-row">
          <label>
            Category
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={saving}
            >
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
              disabled={saving}
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
            disabled={saving}
          />
        </label>

        <label>
          Scripture <span className="hint">(optional)</span>
          <input
            type="text"
            value={scripture}
            onChange={e => setScripture(e.target.value)}
            placeholder="e.g. Philippians 4:6-7"
            disabled={saving}
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Prayer'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
