import { useEffect, useState, useCallback } from 'react'
import { goalsApi } from '@/api/endpoints'
import type { Goal } from '@/types'
import { formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { X, Plus, Trash2 } from 'lucide-react'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', category: 'personal', notes: '', target_date: '',
  })
  const [milestones, setMilestones] = useState<string[]>([''])

  const load = useCallback(async () => { setGoals(await goalsApi.list()) }, [])
  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm({ title: '', category: 'personal', notes: '', target_date: '' })
    setMilestones([''])
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const validMilestones = milestones
      .map(m => m.trim())
      .filter(Boolean)
      .map(text => ({ text, done: false }))
    await goalsApi.create({
      ...form,
      milestones: validMilestones,
    })
    toast.success('Goal created!')
    setShowForm(false)
    resetForm()
    load()
  }

  const addMilestone = () => setMilestones([...milestones, ''])
  const removeMilestone = (idx: number) => {
    const next = milestones.filter((_, i) => i !== idx)
    setMilestones(next.length ? next : [''])
  }
  const updateMilestone = (idx: number, val: string) => {
    const next = [...milestones]
    next[idx] = val
    setMilestones(next)
  }

  const toggleMilestone = async (goal: Goal, idx: number) => {
    const ms = [...goal.milestones]
    ms[idx] = { ...ms[idx], done: !ms[idx].done }
    const done = ms.filter(m => m.done).length
    const progress = ms.length > 0 ? Math.round(done / ms.length * 100) : 0
    await goalsApi.update(goal.id, { milestones: ms, progress })
    load()
  }

  const addMilestoneToGoal = async (goal: Goal, text: string) => {
    if (!text.trim()) return
    const ms = [...goal.milestones, { text: text.trim(), done: false }]
    const done = ms.filter(m => m.done).length
    const progress = ms.length > 0 ? Math.round(done / ms.length * 100) : 0
    await goalsApi.update(goal.id, { milestones: ms, progress })
    load()
  }

  const removeMilestoneFromGoal = async (goal: Goal, idx: number) => {
    const ms = goal.milestones.filter((_: any, i: number) => i !== idx)
    const done = ms.filter((m: any) => m.done).length
    const progress = ms.length > 0 ? Math.round(done / ms.length * 100) : 0
    await goalsApi.update(goal.id, { milestones: ms, progress })
    load()
  }

  const deleteGoal = async (id: string) => {
    await goalsApi.delete(id); toast.success('Goal deleted'); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button className="btn btn-ink btn-sm" onClick={() => { resetForm(); setShowForm(true) }}>+ New Goal</button>
      </div>

      <div className="grid-2">
        {goals.map(g => (
          <GoalCard
            key={g.id}
            goal={g}
            onToggleMilestone={toggleMilestone}
            onAddMilestone={addMilestoneToGoal}
            onRemoveMilestone={removeMilestoneFromGoal}
            onDelete={deleteGoal}
          />
        ))}
      </div>

      {goals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◇</div>
          <div className="empty-title">Set your first goal</div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Goal</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={create}>
              <div className="modal-body">
                <div className="field">
                  <label>Title</label>
                  <input
                    autoFocus
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="What do you want to achieve?"
                  />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="learning">Learning</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Target Date</label>
                    <input
                      type="date"
                      value={form.target_date}
                      onChange={e => setForm({ ...form, target_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Milestones / Steps */}
                <div className="field">
                  <label>Milestones / Steps</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink4)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                        <input
                          value={m}
                          onChange={e => updateMilestone(i, e.target.value)}
                          placeholder={`Step ${i + 1}…`}
                          style={{ flex: 1 }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); addMilestone() }
                          }}
                        />
                        {milestones.length > 1 && (
                          <button type="button" className="btn-icon" onClick={() => removeMilestone(i)} style={{ width: 24, height: 24 }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addMilestone} style={{ alignSelf: 'flex-start', gap: 4 }}>
                      <Plus size={12} /> Add step
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Extra details…"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-ink" disabled={!form.title.trim()}>Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Goal Card Component ── */
interface GoalCardProps {
  goal: Goal
  onToggleMilestone: (goal: Goal, idx: number) => void
  onAddMilestone: (goal: Goal, text: string) => void
  onRemoveMilestone: (goal: Goal, idx: number) => void
  onDelete: (id: string) => void
}

function GoalCard({ goal: g, onToggleMilestone, onAddMilestone, onRemoveMilestone, onDelete }: GoalCardProps) {
  const [newStep, setNewStep] = useState('')

  const handleAddStep = () => {
    if (!newStep.trim()) return
    onAddMilestone(g, newStep)
    setNewStep('')
  }

  return (
    <div className="card" style={{ borderLeft: `3px solid ${g.color}` }}>
      <div className="card-header">
        <div className="card-title" style={{ color: g.color, textTransform: 'none', fontSize: '1rem', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
          {g.title}
        </div>
        <button className="btn-icon" onClick={() => onDelete(g.id)} style={{ fontSize: '0.7rem', color: 'var(--ink5)' }}>
          <Trash2 size={14} />
        </button>
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
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink3)', marginBottom: 12 }}>
        {g.progress}% — {g.milestones.filter((m: any) => m.done).length}/{g.milestones.length} steps
      </div>

      {/* Milestones list */}
      {g.milestones.map((m: { text: string; done: boolean }, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
          <div
            className={`task-check ${m.done ? 'checked' : ''}`}
            onClick={() => onToggleMilestone(g, i)}
            style={{ width: 14, height: 14 }}
          />
          <span style={{
            flex: 1, fontSize: '0.8rem',
            color: m.done ? 'var(--ink4)' : 'var(--ink)',
            textDecoration: m.done ? 'line-through' : 'none',
          }}>
            {m.text}
          </span>
          <button
            className="btn-icon"
            onClick={() => onRemoveMilestone(g, i)}
            style={{ width: 20, height: 20, opacity: 0.4 }}
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {/* Add new step inline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
        <Plus size={14} style={{ color: 'var(--ink5)', flexShrink: 0 }} />
        <input
          value={newStep}
          onChange={e => setNewStep(e.target.value)}
          placeholder="Add a step…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.78rem', fontFamily: 'var(--font-sans)', color: 'var(--ink2)',
          }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddStep() } }}
        />
        {newStep.trim() && (
          <button className="btn btn-ghost btn-sm" onClick={handleAddStep} style={{ fontSize: '0.65rem' }}>Add</button>
        )}
      </div>

      {g.notes && (
        <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--ink3)', fontStyle: 'italic', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
          {g.notes}
        </div>
      )}
    </div>
  )
}

