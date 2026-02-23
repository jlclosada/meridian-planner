import { useEffect, useState, useCallback } from 'react'
import { useModalStore } from '@/stores/modalStore'
import { tasksApi } from '@/api/endpoints'
import type { Task, TaskStatus, Priority, Category } from '@/types'
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/utils/helpers'
import { addDays, format } from 'date-fns'
import toast from 'react-hot-toast'
import { X, Trash2, Calendar, Clock, Tag, Flag, Layers, Palette, ListChecks, FileText, Zap } from 'lucide-react'
import './TaskDetailModal.css'

export default function TaskDetailModal() {
  const { taskDetailId, closeTaskDetail } = useModalStore()
  const [task, setTask] = useState<Task | null>(null)
  const [newCheckItem, setNewCheckItem] = useState('')

  const load = useCallback(async () => {
    if (!taskDetailId) return
    try { setTask(await tasksApi.get(taskDetailId)) }
    catch { closeTaskDetail() }
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
    window.dispatchEvent(new CustomEvent('meridian:refresh'))
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

  const removeChecklistItem = async (idx: number) => {
    if (!task) return
    const checklist = (task.checklist || []).filter((_: any, i: number) => i !== idx)
    await update({ checklist } as any)
  }

  const handleDelete = async () => {
    if (!taskDetailId) return
    await tasksApi.delete(taskDetailId)
    toast.success('Task deleted')
    closeTaskDetail()
    window.dispatchEvent(new CustomEvent('meridian:refresh'))
  }

  if (!taskDetailId || !task) return null

  const checkDone = (task.checklist || []).filter((c: any) => c.done).length
  const checkTotal = (task.checklist || []).length

  return (
    <>
      <div className="tdm-overlay" onClick={closeTaskDetail} />
      <div className="tdm-panel">
        {/* Header */}
        <div className="tdm-header">
          <div className="tdm-header-left">
            <span className="tdm-breadcrumb">Tasks</span>
            <span className="tdm-breadcrumb-sep">/</span>
            <span className="tdm-breadcrumb-current">{task.title.slice(0, 30)}{task.title.length > 30 ? '…' : ''}</span>
          </div>
          <div className="tdm-header-actions">
            <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ gap: 4 }}>
              <Trash2 size={12} /> Delete
            </button>
            <button className="close-btn" onClick={closeTaskDetail}><X size={14} /></button>
          </div>
        </div>

        <div className="tdm-body">
          {/* Title row */}
          <div className="tdm-title-row">
            <div className={`task-check-lg ${task.done ? 'checked' : ''}`} onClick={toggleDone} />
            <input
              className="tdm-title-input"
              defaultValue={task.title}
              placeholder="Task title…"
              onBlur={e => { if (e.target.value !== task.title) update({ title: e.target.value }) }}
            />
          </div>

          {/* Status pills */}
          <div className="tdm-status-row">
            <span className={`status-badge status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            <span className={`prio-badge ${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
            <span className={`tag tag-${task.category}`}>{CATEGORY_LABELS[task.category]}</span>
            {task.recurring && <span className="recurring-badge">↻ {task.recurring}</span>}
          </div>

          {/* Quick date actions */}
          <div className="tdm-quick-actions">
            <button className="tdm-quick-btn" onClick={() => setDate(0)}>
              <Zap size={12} /> Today
            </button>
            <button className="tdm-quick-btn" onClick={() => setDate(1)}>
              <Calendar size={12} /> Tomorrow
            </button>
            <button className="tdm-quick-btn" onClick={() => setDate(7)}>
              <Calendar size={12} /> Next week
            </button>
            <button className="tdm-quick-btn" onClick={() => setDate(null)}>
              <Layers size={12} /> Backlog
            </button>
          </div>

          {/* Properties grid */}
          <div className="tdm-section">
            <div className="tdm-section-header">
              <Flag size={13} />
              <span className="tdm-section-title">Properties</span>
            </div>
            <div className="tdm-props-grid">
              <PropRow icon={<Layers size={13} />} label="Status">
                <select className="tdm-select" value={task.status} onChange={e => update({ status: e.target.value as TaskStatus, done: e.target.value === 'completed' })}>
                  {(Object.entries(STATUS_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </PropRow>
              <PropRow icon={<Flag size={13} />} label="Priority">
                <select className="tdm-select" value={task.priority} onChange={e => update({ priority: e.target.value as Priority })}>
                  {(Object.entries(PRIORITY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </PropRow>
              <PropRow icon={<Tag size={13} />} label="Category">
                <select className="tdm-select" value={task.category} onChange={e => update({ category: e.target.value as Category, color: CATEGORY_COLORS[e.target.value as Category] })}>
                  {(Object.entries(CATEGORY_LABELS) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </PropRow>
              <PropRow icon={<Calendar size={13} />} label="Date">
                <input type="date" className="tdm-select" value={task.date || ''} onChange={e => update({ date: e.target.value || null })} />
              </PropRow>
              <PropRow icon={<Clock size={13} />} label="Time">
                <input type="time" className="tdm-select" value={task.time || ''} onChange={e => update({ time: e.target.value || null })} />
              </PropRow>
              <PropRow icon={<Clock size={13} />} label="Duration">
                <div className="tdm-duration-row">
                  <input type="number" className="tdm-select" style={{ width: 70 }} value={task.duration} min={5} step={5}
                    onChange={e => update({ duration: parseInt(e.target.value) || 30 })} />
                  <span className="tdm-duration-unit">min</span>
                </div>
              </PropRow>
              <PropRow icon={<Palette size={13} />} label="Color">
                <div className="tdm-color-row">
                  <span className="tdm-color-dot" style={{ background: task.color }} />
                  <span className="tdm-color-hex">{task.color}</span>
                </div>
              </PropRow>
            </div>
          </div>

          {/* Checklist */}
          <div className="tdm-section">
            <div className="tdm-section-header">
              <ListChecks size={13} />
              <span className="tdm-section-title">Checklist</span>
              {checkTotal > 0 && (
                <span className="tdm-check-counter">{checkDone}/{checkTotal}</span>
              )}
            </div>
            {checkTotal > 0 && (
              <div className="tdm-check-progress">
                <div className="tdm-check-progress-fill" style={{ width: `${checkTotal ? (checkDone / checkTotal) * 100 : 0}%` }} />
              </div>
            )}
            <div className="tdm-checklist">
              {(task.checklist || []).map((item: { text: string; done: boolean }, i: number) => (
                <div key={i} className={`tdm-check-item ${item.done ? 'is-done' : ''}`}>
                  <div className={`tdm-check-box ${item.done ? 'checked' : ''}`} onClick={() => toggleChecklistItem(i)} />
                  <span className="tdm-check-text">{item.text}</span>
                  <button className="tdm-check-remove" onClick={() => removeChecklistItem(i)}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <div className="tdm-add-check">
                <div className="tdm-check-box-placeholder">+</div>
                <input
                  type="text"
                  placeholder="Add item…"
                  value={newCheckItem}
                  onChange={e => setNewCheckItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addChecklistItem() }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="tdm-section tdm-section-last">
            <div className="tdm-section-header">
              <FileText size={13} />
              <span className="tdm-section-title">Notes</span>
            </div>
            <textarea
              className="tdm-notes-area"
              placeholder="Write notes, context, links…"
              defaultValue={task.notes || ''}
              onBlur={e => { if (e.target.value !== (task.notes || '')) update({ notes: e.target.value }) }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function PropRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="tdm-prop-row">
      <div className="tdm-prop-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="tdm-prop-value">{children}</div>
    </div>
  )
}

