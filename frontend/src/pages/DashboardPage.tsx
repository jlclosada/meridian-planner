import { useEffect, useState, useCallback } from 'react'
import { dashboardApi, tasksApi, habitsApi, goalsApi } from '@/api/endpoints'
import { useModalStore } from '@/stores/modalStore'
import type { DashboardStats, Task, Habit, Goal, TaskStatus } from '@/types'
import { todayString, formatDateShort } from '@/utils/helpers'
import toast from 'react-hot-toast'
import './DashboardPage.css'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const { openTaskDetail } = useModalStore()

  const load = useCallback(async () => {
    const [s, t, h, g] = await Promise.all([
      dashboardApi.stats(), tasksApi.list(), habitsApi.list(), goalsApi.list(),
    ])
    setStats(s); setTasks(t); setHabits(h); setGoals(g)
  }, [])

  useEffect(() => { load() }, [load])

  if (!stats) return <div className="empty-state">Loading…</div>

  const today = todayString()
  const todayTasks = tasks.filter(t => t.date === today)
  const statuses: { key: TaskStatus; label: string; icon: string }[] = [
    { key: 'todo', label: 'To Do', icon: '·' },
    { key: 'in_progress', label: 'In Progress', icon: '▶' },
    { key: 'completed', label: 'Done', icon: '✓' },
    { key: 'blocked', label: 'Blocked', icon: '!' },
  ]

  const upcoming = tasks
    .filter(t => !t.done && t.date && t.date > today)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 5)

  const dayName = new Date().toLocaleDateString('en', { weekday: 'short' }).toLowerCase().slice(0, 3)
  const todayHabits = habits.filter(h => h.target_days === 'daily' || (h.target_days || '').includes(dayName))

  const onDropKanban = async (taskId: string, newStatus: TaskStatus) => {
    await tasksApi.update(taskId, { status: newStatus, done: newStatus === 'completed' })
    if (newStatus === 'completed') toast.success('Done! ✓')
    load()
  }

  const toggleHabit = async (id: string) => {
    await habitsApi.toggle(id, today)
    load()
  }

  const statCards = [
    { label: 'Today', val: `${stats.today.tasks_done}/${stats.today.tasks_total}`, meta: `${stats.today.completion_rate}% complete`, icon: '☀', prog: stats.today.completion_rate, col: '#3B5EA6' },
    { label: 'Habits', val: `${stats.habits.done_today}/${stats.habits.due_today}`, meta: `${stats.habits.rate}% today`, icon: '⟳', prog: stats.habits.rate, col: '#5C7A6A' },
    { label: 'Goals', val: `${stats.goals.total}`, meta: `Avg ${stats.goals.avg_progress}% progress`, icon: '◇', prog: stats.goals.avg_progress, col: '#7B4F8A' },
    { label: 'Week', val: `${stats.week_completion}%`, meta: 'Completion rate', icon: '▦', prog: stats.week_completion, col: '#B8860B' },
  ]

  return (
    <div>
      <div className="grid-4 mb-3">
        {statCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-top"><div className="stat-label">{c.label}</div><div className="stat-icon">{c.icon}</div></div>
            <div className="stat-value">{c.val}</div>
            <div className="stat-meta">{c.meta}</div>
            <div className="progress"><div className="progress-fill" style={{ width: `${c.prog}%`, background: c.col }} /></div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="card mb-3">
        <div className="card-header"><div className="card-title">Today's Tasks — Kanban Board</div></div>
        <div className="kanban-board">
          {statuses.map(s => (
            <div
              key={s.key}
              className="kanban-col"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { const id = e.dataTransfer.getData('taskId'); if (id) onDropKanban(id, s.key) }}
            >
              <div className="kanban-col-header">
                <span className={`status-badge status-${s.key}`}>{s.label}</span>
                <span className="kanban-count">{todayTasks.filter(t => (t.status || 'todo') === s.key).length}</span>
              </div>
              <div className="kanban-cards">
                {todayTasks.filter(t => (t.status || 'todo') === s.key).map(t => (
                  <div
                    key={t.id}
                    className="kanban-card"
                    draggable
                    onDragStart={e => e.dataTransfer.setData('taskId', t.id)}
                    onClick={() => openTaskDetail(t.id)}
                    style={{ borderLeftColor: t.color }}
                  >
                    <div className="kanban-card-title">{t.title}</div>
                    <div className="kanban-card-meta">
                      {t.time && <span>{t.time}</span>}
                      <span className={`tag tag-${t.category}`}>{t.category}</span>
                    </div>
                  </div>
                ))}
                {todayTasks.filter(t => (t.status || 'todo') === s.key).length === 0 && (
                  <div className="kanban-empty">Drop here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 mb-3">
        {/* Goals */}
        <div className="card">
          <div className="card-header"><div className="card-title">Active Goals</div></div>
          {goals.slice(0, 4).map(g => (
            <div key={g.id} className="dash-goal-row">
              <div style={{ width: 3, height: 20, borderRadius: 2, background: g.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                <div className="progress" style={{ marginTop: 4 }}><div className="progress-fill" style={{ width: `${g.progress}%`, background: g.color }} /></div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink3)' }}>{g.progress}%</span>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming</div></div>
          {upcoming.length === 0 && <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--ink4)', fontSize: '0.8rem', fontStyle: 'italic' }}>Nothing upcoming ✦</div>}
          {upcoming.map(t => (
            <div key={t.id} className="dash-goal-row" onClick={() => openTaskDetail(t.id)} style={{ cursor: 'pointer' }}>
              <div style={{ width: 3, height: 20, borderRadius: 2, background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink4)' }}>
                  {formatDateShort(t.date!)}{t.time ? ` · ${t.time}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits */}
      <div className="card">
        <div className="card-header"><div className="card-title">Today's Habits</div></div>
        <div className="dash-habits-grid">
          {todayHabits.map(h => {
            const done = h.completions.includes(today)
            return (
              <div key={h.id} className={`dash-habit ${done ? 'done' : ''}`} onClick={() => toggleHabit(h.id)}>
                <span className="dash-habit-icon">{h.icon}</span>
                <span className="dash-habit-name">{h.name}</span>
                <span className="dash-habit-streak">{h.streak}d</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

