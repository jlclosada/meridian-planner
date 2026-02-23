import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/api/endpoints'
import type { AdminStats } from '@/types'

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try { setStats(await adminApi.stats()) }
    catch { setError('Admin access required') }
  }, [])
  useEffect(() => { load() }, [load])

  if (error) return <div className="empty-state"><div className="empty-title">{error}</div></div>
  if (!stats) return <div className="empty-state">Loading…</div>

  const cards = [
    { label: 'Users', val: stats.users, icon: '👤', col: '#3B5EA6' },
    { label: 'Tasks', val: stats.tasks, icon: '◎', col: '#5C7A6A' },
    { label: 'Habits', val: stats.habits, icon: '⟳', col: '#7B4F8A' },
    { label: 'Goals', val: stats.goals, icon: '◇', col: '#B8860B' },
  ]

  return (
    <div>
      <div className="grid-4 mb-3">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-top"><div className="stat-label">{c.label}</div><div className="stat-icon">{c.icon}</div></div>
            <div className="stat-value" style={{ color: c.col }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Users</div></div>
        {stats.user_list.map((u: { id: string; name: string; email: string; role: string }) => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ink3)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{(u.name || '?')[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink4)' }}>{u.email}</div>
            </div>
            {u.role === 'admin' ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', background: 'var(--gold-bg)', color: 'var(--gold)', padding: '1px 6px', borderRadius: 3 }}>★ Admin</span> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--ink4)' }}>user</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

