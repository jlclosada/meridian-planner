import { useEffect, useState, useCallback } from 'react'
import { notesApi } from '@/api/endpoints'
import type { Note } from '@/types'
import toast from 'react-hot-toast'

const COLORS = ['#FAF8F4', '#FEF9C3', '#DBEAFE', '#F3E8FF', '#D1FAE5', '#FFE4E6']

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState<Note | null>(null)

  const load = useCallback(async () => { setNotes(await notesApi.list()) }, [])
  useEffect(() => { load() }, [load])

  const createNote = async () => {
    const n = await notesApi.create({ title: 'Untitled', content: '' })
    setEditing(n)
    load()
  }

  const saveNote = async (note: Note) => {
    await notesApi.update(note.id, { title: note.title, content: note.content, color: note.color, pinned: note.pinned })
    setEditing(null); load()
  }

  const deleteNote = async (id: string) => {
    await notesApi.delete(id); toast.success('Note deleted'); setEditing(null); load()
  }

  const togglePin = async (note: Note) => {
    await notesApi.update(note.id, { pinned: !note.pinned }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <button className="btn btn-ink btn-sm" onClick={createNote}>+ New Note</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {notes.map(n => (
          <div key={n.id} className="card" style={{ background: n.color, cursor: 'pointer', position: 'relative' }} onClick={() => setEditing(n)}>
            {n.pinned && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: '0.6rem' }}>📌</div>}
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 500, marginBottom: 4, color: 'var(--ink)' }}>{n.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', whiteSpace: 'pre-wrap', overflow: 'hidden', maxHeight: 80 }}>{n.content}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--ink4)', marginTop: 8 }}>
              {new Date(n.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && <div className="empty-state"><div className="empty-icon">📝</div><div className="empty-title">No notes yet</div></div>}

      {editing && (
        <div className="overlay" onClick={() => saveNote(editing)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ background: editing.color }}>
            <div className="modal-header">
              <input
                style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, border: 'none', background: 'transparent', outline: 'none', flex: 1, color: 'var(--ink)' }}
                value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
              />
              <button className="close-btn" onClick={() => saveNote(editing)}>✕</button>
            </div>
            <div className="modal-body">
              <textarea
                rows={12}
                value={editing.content}
                onChange={e => setEditing({ ...editing, content: e.target.value })}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', lineHeight: 1.7, resize: 'vertical', fontFamily: 'var(--font-sans)', color: 'var(--ink2)' }}
                placeholder="Write something…"
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: editing.color === c ? '2px solid var(--ink)' : '2px solid transparent' }}
                    onClick={() => setEditing({ ...editing, color: c })}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={() => togglePin(editing)}>
                {editing.pinned ? '📌 Unpin' : '📌 Pin'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteNote(editing.id)}>Delete</button>
              <button className="btn btn-ink btn-sm" onClick={() => saveNote(editing)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

