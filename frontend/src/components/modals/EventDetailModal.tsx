import { useEffect, useState, useCallback } from 'react'
import { useModalStore } from '@/stores/modalStore'
import { eventsApi } from '@/api/endpoints'
import type { CalendarEvent } from '@/types'
import { formatDate } from '@/utils/helpers'
import { X } from 'lucide-react'
import '../modals/TaskDetailModal.css'

export default function EventDetailModal() {
  const { eventDetailId, closeEventDetail } = useModalStore()
  const [ev, setEv] = useState<CalendarEvent | null>(null)

  const load = useCallback(async () => {
    if (!eventDetailId) return
    try {
      const e = await eventsApi.get(eventDetailId)
      setEv(e)
    } catch { closeEventDetail() }
  }, [eventDetailId, closeEventDetail])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeEventDetail() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeEventDetail])

  if (!eventDetailId || !ev) return null

  let dateLabel = ev.all_day ? 'All day' : ''
  if (ev.start_date) {
    dateLabel = formatDate(ev.start_date)
    if (ev.end_date && ev.end_date !== ev.start_date) dateLabel += ' → ' + formatDate(ev.end_date)
    if (ev.start_time) dateLabel += ' · ' + ev.start_time + (ev.end_time ? ' – ' + ev.end_time : '')
  }

  return (
    <>
      <div className="tdm-overlay" onClick={closeEventDetail} />
      <div className="tdm-panel">
        <div className="tdm-header">
          <span className="tdm-header-label">Event Details</span>
          <button className="close-btn" onClick={closeEventDetail}><X size={14} /></button>
        </div>
        <div className="tdm-body">
          <h2 className="tdm-title-input" style={{ cursor: 'default', borderBottom: 'none' }}>{ev.title}</h2>
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
            <span className={`tag tag-${ev.category}`}>{ev.category}</span>
            {ev.all_day && <span className="recurring-badge">All day</span>}
          </div>
          <div className="tdm-section">
            <div className="tdm-section-title">Details</div>
            <div className="tdm-props">
              <div className="tdm-prop-label">📅 When</div>
              <div className="tdm-prop-value">{dateLabel}</div>
              {ev.location && <>
                <div className="tdm-prop-label">📍 Location</div>
                <div className="tdm-prop-value">{ev.location}</div>
              </>}
              <div className="tdm-prop-label">🎨 Color</div>
              <div className="tdm-prop-value"><span className="tdm-color-dot" style={{ background: ev.color }} /></div>
            </div>
          </div>
          {ev.notes && (
            <div className="tdm-section" style={{ borderBottom: 'none' }}>
              <div className="tdm-section-title">Notes</div>
              <div className="tdm-notes-area" style={{ cursor: 'default', minHeight: 'auto' }}>{ev.notes}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

