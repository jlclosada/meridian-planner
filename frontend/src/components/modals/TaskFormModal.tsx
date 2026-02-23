import { useState } from 'react'
import { tasksApi } from '@/api/endpoints'
import type { Task, Category, Priority } from '@/types'
import { CATEGORY_LABELS, PRIORITY_LABELS, CATEGORY_COLORS } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onSaved: () => void
  defaultDate?: string | null
  defaultTime?: string | null
  editTask?: Task | null
}

export default function TaskFormModal({ onClose, onSaved, defaultDate, defaultTime, editTask }: Props) {
  const [title, setTitle] = useState(editTask?.title || '')
  const [category, setCategory] = useState<Category>(editTask?.category || 'personal')
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium')
  const [date, setDate] = useState(editTask?.date || defaultDate || '')
  const [time, setTime] = useState(editTask?.time || defaultTime || '')
  const [duration, setDuration] = useState(editTask?.duration || 30)
  const [notes, setNotes] = useState(editTask?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const data: Partial<Task> = {
        title: title.trim(),
        category,
        priority,
        date: date || null,
        time: time || null,
        duration,
        notes,
        color: CATEGORY_COLORS[category],
      }
      if (editTask) {
        await tasksApi.update(editTask.id, data)
        toast.success('Task updated')
      } else {
        await tasksApi.create(data)
        toast.success('Task created')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Error saving task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label>Title</label>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value as Category)}>
                  {(Object.entries(CATEGORY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                  {(Object.entries(PRIORITY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                {!date && (
                  <div style={{ marginTop: 4, fontSize: '0.68rem', color: 'var(--teal)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.8rem' }}>📥</span> No date = goes to Backlog
                  </div>
                )}
              </div>
              <div className="field">
                <label>Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Duration (min)</label>
              <input type="number" value={duration} min={5} step={5} onChange={e => setDuration(parseInt(e.target.value) || 30)} />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-ink" disabled={saving || !title.trim()}>
              {saving ? 'Saving…' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

