import { useEffect, useState, useCallback } from 'react'
import { habitsApi } from '@/api/endpoints'
import type { Habit } from '@/types'
import { todayString } from '@/utils/helpers'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import './HabitsPage.css'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '⭐', target_days: 'daily', category: 'personal', color: '#3B5EA6' })

  const load = useCallback(async () => {
    setHabits(await habitsApi.list())
  }, [])
  useEffect(() => { load() }, [load])

  const today = todayString()
  const last14 = Array.from({ length: 14 }, (_, i) => format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'))

  const toggle = async (id: string, date: string) => {
    await habitsApi.toggle(id, date)
    load()
  }

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    await habitsApi.create(form)
    toast.success('Habit created!')
    setShowForm(false)
    setForm({ name: '', icon: '⭐', target_days: 'daily', category: 'personal', color: '#3B5EA6' })
    load()
  }

  const deleteHabit = async (id: string) => {
    await habitsApi.delete(id)
    toast.success('Habit deleted')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button className="btn btn-ink btn-sm" onClick={() => setShowForm(true)}>+ New Habit</button>
      </div>

      <div className="card">
        <div className="habits-matrix">
          <div className="habits-matrix-header">
            <div className="hm-habit-col">Habit</div>
            {last14.map(d => (
              <div key={d} className={`hm-day-col ${d === today ? 'today' : ''}`}>
                <div>{format(new Date(d + 'T12:00'), 'dd')}</div>
                <div style={{ fontSize: '0.5rem' }}>{format(new Date(d + 'T12:00'), 'EEE')}</div>
              </div>
            ))}
            <div className="hm-stat-col">Streak</div>
          </div>

          {habits.map(h => (
            <div key={h.id} className="habits-matrix-row">
              <div className="hm-habit-col">
                <span className="hm-icon">{h.icon}</span>
                <div>
                  <div className="hm-name">{h.name}</div>
                  <div className="hm-target">{h.target_days}</div>
                </div>
                <button className="btn-icon" onClick={() => deleteHabit(h.id)} style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--ink5)' }}>✕</button>
              </div>
              {last14.map(d => {
                const done = h.completions.includes(d)
                return (
                  <div key={d} className={`hm-cell ${d === today ? 'today' : ''}`} onClick={() => toggle(h.id, d)}>
                    <div className={`hm-dot ${done ? 'filled' : ''}`} style={done ? { background: h.color, borderColor: h.color } : undefined} />
                  </div>
                )
              })}
              <div className="hm-stat-col">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>{h.streak}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--ink4)' }}>best {h.best_streak}</span>
              </div>
            </div>
          ))}
          {habits.length === 0 && <div className="empty-state"><div className="empty-title">No habits yet — start building one!</div></div>}
        </div>
      </div>

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">New Habit</h2><button className="close-btn" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={createHabit}>
              <div className="modal-body">
                <div className="field"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus /></div>
                <div className="grid-2">
                  <div className="field"><label>Icon</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
                  <div className="field"><label>Frequency</label>
                    <select value={form.target_days} onChange={e => setForm({ ...form, target_days: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="mon,wed,fri">Mon/Wed/Fri</option>
                      <option value="mon,tue,wed,thu,fri">Weekdays</option>
                      <option value="sat,sun">Weekends</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-ink" disabled={!form.name.trim()}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

