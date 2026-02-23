import { useEffect, useState, useCallback } from 'react'
import { tasksApi, eventsApi } from '@/api/endpoints'
import { useAppStore } from '@/stores/appStore'
import { useModalStore } from '@/stores/modalStore'
import type { Task, CalendarEvent } from '@/types'
import { todayString } from '@/utils/helpers'
import './MonthPage.css'

export default function MonthPage() {
  const { monthDate, setMonthDate } = useAppStore()
  const { openTaskDetail, openEventDetail } = useModalStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const monthStr = monthDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const load = useCallback(async () => {
    const [t, e] = await Promise.all([tasksApi.list(), eventsApi.list(monthKey)])
    setTasks(t); setEvents(e)
  }, [monthKey])

  useEffect(() => { load() }, [load])

  const today = todayString()
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells: { day: number; dateStr: string; isOther: boolean }[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, dateStr: '', isOther: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isOther: false })
  }
  for (let i = 0; cells.length < totalCells; i++) {
    cells.push({ day: i + 1, dateStr: '', isOther: true })
  }

  return (
    <div>
      <div className="day-nav mb-2">
        <button className="btn-icon" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>←</button>
        <button className="btn-icon" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>→</button>
        <div className="day-title">{monthStr}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setMonthDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
          This month
        </button>
      </div>

      <div className="month-grid">
        {dayNames.map(d => <div key={d} className="month-header-cell">{d}</div>)}
        {cells.map((cell, i) => {
          if (cell.isOther) {
            return <div key={i} className="month-day other-month"><div className="month-day-num">{cell.day}</div></div>
          }
          const dayTasks = tasks.filter(t => t.date === cell.dateStr && !t.done).slice(0, 3)
          const dayEvents = events.filter(e => e.start_date <= cell.dateStr && e.end_date >= cell.dateStr).slice(0, 2)
          const shown = [...dayEvents.map(e => ({ ...e, _isEvent: true })), ...dayTasks.map(t => ({ ...t, _isEvent: false }))] as any[]
          const totalItems = tasks.filter(t => t.date === cell.dateStr).length + dayEvents.length
          const moreCount = totalItems - shown.slice(0, 3).length

          return (
            <div key={i} className={`month-day ${cell.dateStr === today ? 'today' : ''}`}>
              <div className="month-day-num">{cell.day}</div>
              {shown.slice(0, 3).map((item: any) => (
                <div
                  key={item.id}
                  className="month-task-pill"
                  style={{ borderLeftColor: item.color, background: `${item.color}18`, color: item.color }}
                  onClick={e => { e.stopPropagation(); item._isEvent ? openEventDetail(item.id) : openTaskDetail(item.id) }}
                >
                  {item.title}
                </div>
              ))}
              {moreCount > 0 && <div className="month-more">+{moreCount} more</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

