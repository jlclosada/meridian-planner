import { useEffect, useState, useCallback } from 'react'
import { tasksApi, eventsApi } from '@/api/endpoints'
import { useAppStore } from '@/stores/appStore'
import { useModalStore } from '@/stores/modalStore'
import type { Task, CalendarEvent } from '@/types'
import { toDateString, STATUS_LABELS } from '@/utils/helpers'
import { addDays, isToday } from 'date-fns'
import TaskFormModal from '@/components/modals/TaskFormModal'
import toast from 'react-hot-toast'
import './TodayPage.css'

export default function TodayPage() {
  const { viewDate, setViewDate } = useAppStore()
  const { openTaskDetail, openEventDetail } = useModalStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [backlog, setBacklog] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showForm, setShowForm] = useState<{ date?: string; time?: string } | null>(null)

  const dateStr = toDateString(viewDate)

  const load = useCallback(async () => {
    const [t, b, ev] = await Promise.all([
      tasksApi.list({ date: dateStr }),
      tasksApi.list({ backlog: '1' }),
      eventsApi.list(dateStr.slice(0, 7)),
    ])
    setTasks(t)
    setBacklog(b)
    setEvents(ev.filter((e: CalendarEvent) => e.start_date <= dateStr && e.end_date >= dateStr))
  }, [dateStr])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener('meridian:refresh', handler)
    return () => window.removeEventListener('meridian:refresh', handler)
  }, [load])
  const toggleTask = async (id: string, done: boolean) => {
    await tasksApi.update(id, { done, status: done ? 'completed' : 'todo' })
    if (done) toast.success('Done ✓')
    load()
  }

  const assignBacklog = async (id: string) => {
    await tasksApi.update(id, { date: dateStr })
    toast.success('Added to today')
    load()
  }

  const onDrop = async (e: React.DragEvent, time: string | null) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('taskId')
    if (!id) return
    await tasksApi.update(id, { time, date: dateStr })
    toast.success('Task moved')
    load()
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 5)
  const shownIds = new Set<string>()

  const fmt = viewDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  const isViewToday = isToday(viewDate)

  return (
    <div>
      {/* Nav */}
      <div className="day-nav">
        <button className="btn-icon" onClick={() => setViewDate(addDays(viewDate, -1))}>←</button>
        <button className="btn-icon" onClick={() => setViewDate(addDays(viewDate, 1))}>→</button>
        <div className="day-title">{fmt}</div>
        {isViewToday && <span className="today-badge">Today</span>}
        <div style={{ flex: 1 }} />
        {!isViewToday && <button className="btn btn-ghost btn-sm" onClick={() => setViewDate(new Date())}>Go to today</button>}
        <button className="btn btn-ghost btn-sm" onClick={() => setShowForm({ date: dateStr })}>+ Add task</button>
      </div>

      <div className="today-layout">
        {/* Timeline */}
        <div className="timeline-col">
          {/* Events */}
          {events.length > 0 && (
            <div className="mb-2">
              <div className="card-title mb-1">Events</div>
              {events.map(ev => (
                <div key={ev.id} className="timeline-event" style={{ borderLeftColor: ev.color }} onClick={() => openEventDetail(ev.id)}>
                  <div className="t-task-title">{ev.title}</div>
                  <div className="t-task-time">
                    {ev.all_day ? 'All day' : (ev.start_time || '')}
                    {ev.location ? ` · 📍 ${ev.location}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hour slots */}
          {hours.map(h => {
            const hourTasks = tasks.filter(t => {
              if (!t.time) return false
              const [th] = t.time.split(':').map(Number)
              return th === h
            })
            hourTasks.forEach(t => shownIds.add(t.id))
            const hLabel = h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`

            return (
              <div key={h} className="timeline-hour">
                <div className="hour-label">{hLabel}</div>
                <div
                  className="timeline-slot"
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.currentTarget.classList.remove('drag-over'); onDrop(e, `${String(h).padStart(2, '0')}:00`) }}
                >
                  {hourTasks.map(t => (
                    <TaskRow key={t.id} task={t} onToggle={toggleTask} onClick={() => openTaskDetail(t.id)} />
                  ))}
                  <div className="add-task-inline" onClick={() => setShowForm({ date: dateStr, time: `${String(h).padStart(2, '0')}:00` })}>
                    + Add at {hLabel}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Unscheduled */}
          {(() => {
            const unscheduled = tasks.filter(t => !shownIds.has(t.id))
            if (unscheduled.length === 0) return null
            return (
              <div className="timeline-hour">
                <div className="hour-label" style={{ fontSize: '0.55rem' }}>—</div>
                <div className="timeline-slot" onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, null)}>
                  <div className="card-title mb-1">Unscheduled</div>
                  {unscheduled.map(t => (
                    <TaskRow key={t.id} task={t} onToggle={toggleTask} onClick={() => openTaskDetail(t.id)} />
                  ))}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Backlog sidebar */}
        <div className="backlog-col">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Backlog</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ink4)' }}>{backlog.length}</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--ink4)', marginBottom: 8, fontStyle: 'italic' }}>
              Drag tasks to a time slot or press + Today
            </div>
            {backlog.length === 0 && <div style={{ color: 'var(--ink4)', fontSize: '0.78rem', textAlign: 'center', padding: '1rem 0' }}>Backlog is empty ✦</div>}
            {backlog.map(t => (
              <div
                key={t.id}
                className="backlog-item"
                draggable
                onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
              >
                <div style={{ width: 3, height: 16, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'grab' }}>{t.title}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => assignBacklog(t.id)} style={{ flexShrink: 0, fontSize: '0.6rem' }}>+ Today</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <TaskFormModal
          onClose={() => setShowForm(null)}
          onSaved={load}
          defaultDate={showForm.date}
          defaultTime={showForm.time}
        />
      )}
    </div>
  )
}

function TaskRow({ task: t, onToggle, onClick }: { task: Task; onToggle: (id: string, done: boolean) => void; onClick: () => void }) {
  return (
    <div
      className={`timeline-task ${t.done ? 'done' : ''}`}
      draggable
      onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
      onClick={onClick}
      style={{ borderLeftColor: t.color, background: `${t.color}0f` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          className={`task-check ${t.done ? 'checked' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(t.id, !t.done) }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-task-title">{t.title}</div>
          <div className="t-task-time">
            {t.time || ''} {t.duration ? `· ${t.duration}m` : ''}
          </div>
        </div>
        <span className={`status-badge status-${t.status || 'todo'}`} style={{ fontSize: '0.55rem' }}>
          {STATUS_LABELS[t.status || 'todo']}
        </span>
      </div>
    </div>
  )
}

