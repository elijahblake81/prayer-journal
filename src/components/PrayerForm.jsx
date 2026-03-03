// src/components/PrayerForm.jsx
import { useEffect, useState } from 'react';

export default function PrayerForm({
  initialValues = {},
  onSubmit,
  submitLabel = 'Save',
  showAnsweredFields = false,
}) {
  const [title, setTitle] = useState(initialValues.title || '');
  const [category, setCategory] = useState(initialValues.category || '');
  const [content, setContent] = useState(initialValues.content || '');
  const [isAnswered, setIsAnswered] = useState(!!initialValues.isAnswered);
  const [answeredAt, setAnsweredAt] = useState(initialValues.answeredAt || '');

  useEffect(() => {
    setTitle(initialValues.title || '');
    setCategory(initialValues.category || '');
    setContent(initialValues.content || '');
    setIsAnswered(!!initialValues.isAnswered);
    setAnsweredAt(initialValues.answeredAt || '');
  }, [initialValues]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      category: category.trim() || null,
      content: content.trim(),
      isAnswered: !!isAnswered,
      answeredAt: isAnswered
        ? (answeredAt || new Date().toISOString())
        : null,
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Prayer for wisdom"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <input
          className="w-full border rounded p-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="(Optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Details</label>
        <textarea
          className="w-full border rounded p-2"
          rows={5}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What specifically are you praying for?"
        />
      </div>

      {showAnsweredFields && (
        <div className="space-y-2 border-t pt-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnswered}
              onChange={e => setIsAnswered(e.target.checked)}
            />
            <span className="text-sm">Mark as answered</span>
          </label>

          {isAnswered && (
            <div>
              <label className="block text-sm font-medium">Answered Date/Time</label>
              <input
                type="datetime-local"
                className="border rounded p-2"
                value={answeredAt ? new Date(answeredAt).toISOString().slice(0,16) : ''}
                onChange={e => {
                  const iso = new Date(e.target.value).toISOString();
                  setAnsweredAt(iso);
                }}
              />
            </div>
          )}
        </div>
      )}

      <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2">
        {submitLabel}
      </button>
    </form>
  );
}