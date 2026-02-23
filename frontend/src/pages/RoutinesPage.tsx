import { useEffect, useState, useCallback } from 'react'
import { routinesApi } from '@/api/endpoints'
import type { Routine } from '@/types'
import toast from 'react-hot-toast'

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '🔄', time: '08:00', days: 'daily', steps: '' })

  const load = useCallback(async () => { setRoutines(await routinesApi.list()) }, [])
  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    await routinesApi.create({
      ...form,
      steps: form.steps.split('\n').map(s => s.trim()).filter(Boolean),
    } as any)
    toast.success('Routine created!')
    setShowForm(false); setForm({ name: '', icon: '🔄', time: '08:00', days: 'daily', steps: '' }); load()
  }

  const deleteRoutine = async (id: string) => {
    await routinesApi.delete(id); toast.success('Deleted'); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button className="btn btn-ink btn-sm" onClick={() => setShowForm(true)}>+ New Routine</button>
      </div>

      <div className="grid-3">
        {routines.map(r => (
          <div key={r.id} className="card" style={{ borderTop: `3px solid ${r.color}` }}>
            <div className="card-header">
              <span style={{ fontSize: '1.2rem' }}>{r.icon} <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{r.name}</span></span>
              <button className="btn-icon" onClick={() => deleteRoutine(r.id)} style={{ fontSize: '0.7rem', color: 'var(--ink5)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink3)' }}>⏰ {r.time}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink3)' }}>📅 {r.days}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink3)' }}>⏱ {r.duration}m</span>
            </div>
            <ol style={{ paddingLeft: 16, fontSize: '0.82rem', color: 'var(--ink2)' }}>
              {r.steps.map((s: string, i: number) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
            </ol>
          </div>
        ))}
      </div>

      {routines.length === 0 && <div className="empty-state"><div className="empty-icon">⟳</div><div className="empty-title">Create your first routine</div></div>}

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">New Routine</h2><button className="close-btn" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={create}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="field"><label>Name</label><input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="field"><label>Icon</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
                </div>
                <div className="grid-2">
                  <div className="field"><label>Time</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                  <div className="field"><label>Days</label>
                    <select value={form.days} onChange={e => setForm({ ...form, days: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="mon,tue,wed,thu,fri">Weekdays</option>
                      <option value="sat,sun">Weekends</option>
                      <option value="sunday">Sundays</option>
                    </select>
                  </div>
                </div>
                <div className="field"><label>Steps (one per line)</label><textarea rows={4} value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} placeholder="Step 1&#10;Step 2&#10;Step 3" /></div>
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

