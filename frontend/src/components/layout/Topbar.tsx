import { useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { Search, Plus } from 'lucide-react'
import TaskFormModal from '@/components/modals/TaskFormModal'
import './Topbar.css'

export default function Topbar() {
  const { currentPage, setSearchOpen, navigate } = useAppStore()
  const { user, logout } = useAuthStore()
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    tasks: 'All Tasks',
    habits: 'Habits',
    goals: 'Goals',
    routines: 'Routines',
    notes: 'Notes',
    admin: 'Admin',
    profile: 'Profile',
  }

  return (
    <>
      <header className="topbar">
        <h1 className="topbar-title">{titles[currentPage] || 'Meridian'}</h1>
        <span className="topbar-date">
          {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div style={{ flex: 1 }} />
        <div className="topbar-actions">
          <button
            className="btn btn-ink btn-sm"
            onClick={() => setShowQuickAdd(true)}
            title="Quick add task"
            style={{ gap: 4 }}
          >
            <Plus size={14} /> New task
          </button>
          <button className="btn-icon" onClick={() => setSearchOpen(true)} title="Search (⌘K)">
            <Search size={16} />
          </button>
          <div className="user-pill" onClick={() => navigate('profile')} style={{ cursor: 'pointer' }}>
            <div className="user-av">{user?.avatar || '?'}</div>
            <span className="user-name-top">{user?.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </header>

      {showQuickAdd && (
        <TaskFormModal
          onClose={() => setShowQuickAdd(false)}
          onSaved={() => {
            setShowQuickAdd(false)
            // Trigger a page refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('meridian:refresh'))
          }}
        />
      )}
    </>
  )
}

