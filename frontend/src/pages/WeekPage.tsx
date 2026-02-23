import { Fragment, useEffect, useState, useCallback } from 'react'
import { tasksApi } from '@/api/endpoints'
import { useAppStore } from '@/stores/appStore'
import { useModalStore } from '@/stores/modalStore'
import type { Task } from '@/types'
import { toDateString, todayString, getWeekDays } from '@/utils/helpers'
import { addDays } from 'date-fns'
import toast from 'react-hot-toast'
import './WeekPage.css'

export default function WeekPage() {
  const { weekStart, setWeekStart } = useAppStore()
  const { openTaskDetail } = useModalStore()
  const [tasks, setTasks] = useState<Task[]>([])

  const load = useCallback(async () => {
    const t = await tasksApi.list()
    setTasks(t)
  }, [])

  useEffect(() => { load() }, [load])

  const days = getWeekDays(weekStart)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7)
  const today = todayString()
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const onDrop = async (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('taskId')
    if (!id) return
    await tasksApi.update(id, { date, time })
    toast.success('Task moved')
    load()
  }

  const prevWeek = () => setWeekStart(addDays(weekStart, -7))
  const nextWeek = () => setWeekStart(addDays(weekStart, 7))

  return (
    <div>
      <div className="day-nav mb-2">
        <button className="btn-icon" onClick={prevWeek}>←</button>
        <button className="btn-icon" onClick={nextWeek}>→</button>
        <div className="day-title">
          {weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} — {addDays(weekStart, 6).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(getWeekStartDate(new Date()))}>This week</button>
      </div>

      <div className="week-grid">
        <div className="week-col-header" style={{ background: 'var(--paper2)' }}></div>
        {days.map((d: Date, i: number) => {
          const dStr = toDateString(d)
          return (
            <div key={i} className={`week-col-header ${dStr === today ? 'today' : ''}`}>
              <div className="wch-day">{dayNames[i]}</div>
              <div className={`wch-date ${dStr === today ? 'today' : ''}`}>{d.getDate()}</div>
            </div>
          )
        })}

        {hours.map(h => (
          <Fragment key={h}>
            <div className="week-time-col">
              <div className="week-hour-label">{h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}</div>
            </div>
            {days.map((d: Date, di: number) => {
              const dStr = toDateString(d)
              const hourTasks = tasks.filter(t => {
                if (t.date !== dStr || !t.time) return false
                const [th] = t.time.split(':').map(Number)
                return th === h
              })
              return (
                <div
                  key={`${h}-${di}`}
                  className={`week-cell ${dStr === today ? 'today-col' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => onDrop(e, dStr, `${String(h).padStart(2, '0')}:00`)}
                >
                  {hourTasks.map(t => (
                    <div
                      key={t.id}
                      className={`week-task-chip ${t.done ? 'done-chip' : ''}`}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
                      onClick={e => { e.stopPropagation(); openTaskDetail(t.id) }}
                      style={{ borderLeftColor: t.color, background: `${t.color}18`, color: t.color }}
                    >
                      {t.done ? '✓ ' : ''}{t.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function getWeekStartDate(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

