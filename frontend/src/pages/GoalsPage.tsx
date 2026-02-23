import { useEffect, useState, useCallback } from 'react'
import { goalsApi } from '@/api/endpoints'
import type { Goal } from '@/types'
import { formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'personal', notes: '' })

  const load = useCallback(async () => { setGoals(await goalsApi.list()) }, [])
  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await goalsApi.create(form)
    toast.success('Goal created!')
    setShowForm(false); setForm({ title: '', category: 'personal', notes: '' }); load()
  }


  const toggleMilestone = async (goal: Goal, idx: number) => {
    const milestones = [...goal.milestones]
    milestones[idx] = { ...milestones[idx], done: !milestones[idx].done }
    const done = milestones.filter(m => m.done).length
    const progress = Math.round(done / milestones.length * 100)
    await goalsApi.update(goal.id, { milestones, progress })
    load()
  }

  const deleteGoal = async (id: string) => {
    await goalsApi.delete(id); toast.success('Goal deleted'); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button className="btn btn-ink btn-sm" onClick={() => setShowForm(true)}>+ New Goal</button>
      </div>

      <div className="grid-2">
        {goals.map(g => (
          <div key={g.id} className="card" style={{ borderLeft: `3px solid ${g.color}` }}>
            <div className="card-header">
              <div className="card-title" style={{ color: g.color, textTransform: 'none', fontSize: '1rem', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{g.title}</div>
              <button className="btn-icon" onClick={() => deleteGoal(g.id)} style={{ fontSize: '0.7rem', color: 'var(--ink5)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={`tag tag-${g.category}`}>{g.category}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink4)' }}>
                Due: {formatDate(g.target_date)}
              </span>
            </div>
            <div className="progress mb-1" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${g.progress}%`, background: g.color }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink3)', marginBottom: 8 }}>{g.progress}%</div>

            {g.milestones.map((m: { text: string; done: boolean }, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                <div className={`task-check ${m.done ? 'checked' : ''}`} onClick={() => toggleMilestone(g, i)} style={{ width: 13, height: 13 }} />
                <span style={{ fontSize: '0.78rem', color: m.done ? 'var(--ink4)' : 'var(--ink)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.text}</span>
              </div>
            ))}
            {g.notes && <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--ink3)', fontStyle: 'italic' }}>{g.notes}</div>}
          </div>
        ))}
      </div>

      {goals.length === 0 && <div className="empty-state"><div className="empty-icon">◇</div><div className="empty-title">Set your first goal</div></div>}

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">New Goal</h2><button className="close-btn" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={create}>
              <div className="modal-body">
                <div className="field"><label>Title</label><input autoFocus value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div className="field"><label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="work">Work</option><option value="health">Health</option><option value="learning">Learning</option><option value="personal">Personal</option>
                  </select>
                </div>
                <div className="field"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-ink">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

