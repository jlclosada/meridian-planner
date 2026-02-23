import { useEffect, useState, useCallback } from 'react'
import { useModalStore } from '@/stores/modalStore'
import { tasksApi } from '@/api/endpoints'
import type { Task, TaskStatus, Priority, Category } from '@/types'
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '@/utils/helpers'
import { addDays, format } from 'date-fns'
import toast from 'react-hot-toast'
import { X, Trash2 } from 'lucide-react'
import './TaskDetailModal.css'

export default function TaskDetailModal() {
  const { taskDetailId, closeTaskDetail } = useModalStore()
  const [task, setTask] = useState<Task | null>(null)
  const [newCheckItem, setNewCheckItem] = useState('')

  const load = useCallback(async () => {
    if (!taskDetailId) return
    try {
      const t = await tasksApi.get(taskDetailId)
      setTask(t)
    } catch { closeTaskDetail() }
  }, [taskDetailId, closeTaskDetail])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTaskDetail() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeTaskDetail])

  const update = async (data: Partial<Task>) => {
    if (!taskDetailId) return
    await tasksApi.update(taskDetailId, data)
    load()
  }

  const toggleDone = async () => {
    if (!task) return
    const done = !task.done
    await update({ done, status: done ? 'completed' : 'todo' })
    if (done) toast.success('Done! ✓')
  }

  const setDate = async (daysOffset: number | null) => {
    const dateVal = daysOffset === null ? null : format(addDays(new Date(), daysOffset), 'yyyy-MM-dd')
    await update({ date: dateVal })
    toast.success(daysOffset === 0 ? 'Scheduled for today' : daysOffset === null ? 'Moved to backlog' : 'Date updated')
  }

  const addChecklistItem = async () => {
    if (!newCheckItem.trim() || !task) return
    const checklist = [...(task.checklist || []), { text: newCheckItem.trim(), done: false }]
    await update({ checklist } as any)
    setNewCheckItem('')
  }

  const toggleChecklistItem = async (idx: number) => {
    if (!task) return
    const checklist = [...(task.checklist || [])]
    if (checklist[idx]) checklist[idx] = { ...checklist[idx], done: !checklist[idx].done }
    await update({ checklist } as any)
  }

  const handleDelete = async () => {
    if (!taskDetailId) return
    await tasksApi.delete(taskDetailId)
    toast.success('Task deleted')
    closeTaskDetail()
  }

  if (!taskDetailId || !task) return null

  return (
    <>
      <div className="tdm-overlay" onClick={closeTaskDetail} />
      <div className="tdm-panel">
        <div className="tdm-header">
          <span className="tdm-header-label">Task Details</span>
          <div className="tdm-header-actions">
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={12} /> Delete</button>
            <button className="close-btn" onClick={closeTaskDetail}><X size={14} /></button>
          </div>
        </div>

        <div className="tdm-body">
          {/* Title */}
          <div className="tdm-top-row">
            <div
              className={`task-check-lg ${task.done ? 'checked' : ''}`}
              onClick={toggleDone}
            />
            <span className={`status-badge status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            {task.recurring && <span className="recurring-badge">↻ {task.recurring}</span>}
          </div>
          <input
            className="tdm-title-input"
            defaultValue={task.title}
            onBlur={e => { if (e.target.value !== task.title) update({ title: e.target.value }) }}
          />

          {/* Properties */}
          <div className="tdm-section">
            <div className="tdm-section-title">Properties</div>
            <div className="tdm-props">
              <Row label="☀ Status">
                <select className="tdm-select" value={task.status} onChange={e => update({ status: e.target.value as TaskStatus })}>
                  {(Object.entries(STATUS_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Row>
              <Row label="↕ Priority">
                <select className="tdm-select" value={task.priority} onChange={e => update({ priority: e.target.value as Priority })}>
                  {(Object.entries(PRIORITY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Row>
              <Row label="◎ Category">
                <select className="tdm-select" value={task.category} onChange={e => update({ category: e.target.value as Category })}>
                  {(Object.entries(CATEGORY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Row>
              <Row label="📅 Date">
                <div>
                  <input type="date" className="tdm-select" value={task.date || ''} onChange={e => update({ date: e.target.value || null })} />
                  <div className="date-quick-btns">
                    <button type="button" className="date-quick-btn" onClick={() => setDate(0)}>Today</button>
                    <button type="button" className="date-quick-btn" onClick={() => setDate(1)}>Tomorrow</button>
                    <button type="button" className="date-quick-btn" onClick={() => setDate(7)}>Next week</button>
                    <button type="button" className="date-quick-btn" onClick={() => setDate(null)}>No date</button>
                  </div>
                </div>
              </Row>
              <Row label="🕐 Time">
                <input type="time" className="tdm-select" value={task.time || ''} onChange={e => update({ time: e.target.value || null })} />
              </Row>
              <Row label="⏱ Duration">
                <span>
                  <input type="number" className="tdm-select" style={{ width: 80 }} value={task.duration} min={5} step={5}
                    onChange={e => update({ duration: parseInt(e.target.value) || 30 })} /> min
                </span>
              </Row>
              {task.tags.length > 0 && (
                <Row label="🏷 Tags">
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {task.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
                  </div>
                </Row>
              )}
              <Row label="🎨 Color">
                <span className="tdm-color-dot" style={{ background: task.color }} />
              </Row>
            </div>
          </div>

          {/* Checklist */}
          <div className="tdm-section">
            <div className="tdm-section-title">Checklist</div>
            {(task.checklist || []).map((item: { text: string; done: boolean }, i: number) => (
              <div key={i} className="tdm-check-item">
                <div className={`tdm-check-box ${item.done ? 'checked' : ''}`} onClick={() => toggleChecklistItem(i)} />
                <span style={item.done ? { textDecoration: 'line-through', color: 'var(--ink4)' } : undefined}>{item.text}</span>
              </div>
            ))}
            <div className="tdm-add-check">
              <span style={{ color: 'var(--ink5)' }}>+</span>
              <input
                type="text" placeholder="Add checklist item…"
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addChecklistItem() }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="tdm-section" style={{ borderBottom: 'none' }}>
            <div className="tdm-section-title">Notes</div>
            <textarea
              className="tdm-notes-area"
              placeholder="Write notes, context, links…"
              defaultValue={task.notes || ''}
              onBlur={e => { if (e.target.value !== (task.notes || '')) update({ notes: e.target.value }) }}
            />
          </div>

          {/* Quick actions */}
          <div style={{ paddingTop: '0.5rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setDate(0)}>☀ Move to today</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDate(1)}>→ Move to tomorrow</button>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="tdm-prop-label">{label}</div>
      <div className="tdm-prop-value">{children}</div>
    </>
  )
}

