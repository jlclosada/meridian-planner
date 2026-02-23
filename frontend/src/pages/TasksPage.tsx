import { useEffect, useState, useCallback } from 'react'
import { tasksApi } from '@/api/endpoints'
import { useModalStore } from '@/stores/modalStore'
import type { Task } from '@/types'
import { todayString, formatDateShort, STATUS_LABELS, PRIORITY_LABELS } from '@/utils/helpers'
import TaskFormModal from '@/components/modals/TaskFormModal'
import toast from 'react-hot-toast'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'backlog'>('all')
  const [showForm, setShowForm] = useState(false)
  const { openTaskDetail } = useModalStore()

  const load = useCallback(async () => {
    const t = await tasksApi.list()
    setTasks(t)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener('meridian:refresh', handler)
    return () => window.removeEventListener('meridian:refresh', handler)
  }, [load])

  const today = todayString()

  let filtered = tasks
  if (filter === 'pending') filtered = tasks.filter(t => !t.done)
  if (filter === 'done') filtered = tasks.filter(t => t.done)
  if (filter === 'backlog') filtered = tasks.filter(t => !t.date)

  const toggleTask = async (id: string, done: boolean) => {
    await tasksApi.update(id, { done, status: done ? 'completed' : 'todo' })
    if (done) toast.success('Done ✓')
    load()
  }

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id)
    toast.success('Task deleted')
    load()
  }

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: `All (${tasks.length})` },
    { key: 'pending', label: `Pending (${tasks.filter(t => !t.done).length})` },
    { key: 'done', label: `Done (${tasks.filter(t => t.done).length})` },
    { key: 'backlog', label: `Backlog (${tasks.filter(t => !t.date).length})` },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-ink' : 'btn-ghost'}`}
            onClick={() => setFilter(f.key)}
          >{f.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-ink btn-sm" onClick={() => setShowForm(true)}>+ New Task</button>
      </div>

      <div className="card">
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-title">No tasks here</div></div>}
        {filtered.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => openTaskDetail(t.id)}>
            <div className={`task-check ${t.done ? 'checked' : ''}`} onClick={e => { e.stopPropagation(); toggleTask(t.id, !t.done) }} />
            <div style={{ width: 3, height: 20, borderRadius: 2, background: t.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', color: t.done ? 'var(--ink4)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
            </div>
            <span className={`tag tag-${t.category}`} style={{ fontSize: '0.6rem' }}>{t.category}</span>
            <span className={`prio-badge ${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
            <span className={`status-badge status-${t.status}`} style={{ fontSize: '0.55rem' }}>{STATUS_LABELS[t.status]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink4)', minWidth: 50, textAlign: 'right' }}>
              {t.date ? (t.date === today ? 'Today' : formatDateShort(t.date)) : 'Backlog'}
            </span>
            <button className="btn-icon" onClick={e => { e.stopPropagation(); deleteTask(t.id) }} title="Delete" style={{ fontSize: '0.7rem', color: 'var(--ink5)' }}>✕</button>
          </div>
        ))}
      </div>

      {showForm && <TaskFormModal onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  )
}

