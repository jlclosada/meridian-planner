import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useModalStore } from '@/stores/modalStore'
import { tasksApi } from '@/api/endpoints'
import type { Task } from '@/types'
import { todayString, formatDateShort } from '@/utils/helpers'
import { X, Search } from 'lucide-react'

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useAppStore()
  const { openTaskDetail } = useModalStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Task[]>([])

  useEffect(() => {
    if (!searchOpen) { setQuery(''); setResults([]) }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const tasks = await tasksApi.list({ q: query })
        setResults(tasks.slice(0, 15))
      } catch { setResults([]) }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  if (!searchOpen) return null

  const today = todayString()

  return (
    <div className="overlay" onClick={() => setSearchOpen(false)}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--line)' }}>
          <Search size={16} style={{ color: 'var(--ink4)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks…"
            autoFocus
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.95rem', fontFamily: 'var(--font-sans)', color: 'var(--ink)',
            }}
          />
          <button className="close-btn" onClick={() => setSearchOpen(false)}><X size={14} /></button>
        </div>
        <div style={{ padding: '0.5rem', maxHeight: 400, overflowY: 'auto' }}>
          {!query.trim() && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink4)', fontSize: '0.82rem' }}>
              Start typing to search…
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink4)', fontSize: '0.82rem' }}>
              No results for "{query}"
            </div>
          )}
          {results.map(t => (
            <div
              key={t.id}
              onClick={() => { openTaskDetail(t.id); setSearchOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem',
                borderRadius: 'var(--r)', cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 3, height: 20, borderRadius: 2, background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: t.done ? 'var(--ink4)' : 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.title}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink4)' }}>
                {t.date ? (t.date === today ? 'Today' : formatDateShort(t.date)) : 'Backlog'}
              </span>
              <span className={`tag tag-${t.category}`} style={{ fontSize: '0.6rem' }}>{t.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

