import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPrayers, savePrayers } from '../lib/storage'
import { format } from 'date-fns'

const CATEGORIES = ['Thanksgiving', 'Supplication', 'Intercession', 'Confession', 'Worship', 'Other']

export default function AddPrayer() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [scripture, setScripture] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return

    const prayers = loadPrayers()
    const prayer = {
      id: crypto.randomUUID(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      date,
      scripture: scripture.trim() || null,
      answered: null,
      createdAt: new Date().toISOString(),
    }
    prayers.unshift(prayer)
    savePrayers(prayers)
    navigate('/')
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
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
