import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { Search } from 'lucide-react'
import './Topbar.css'

export default function Topbar() {
  const { currentPage, setSearchOpen } = useAppStore()
  const { user, logout } = useAuthStore()

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
  }

  return (
    <header className="topbar">
      <h1 className="topbar-title">{titles[currentPage] || 'Meridian'}</h1>
      <span className="topbar-date">
        {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
      <div style={{ flex: 1 }} />
      <div className="topbar-actions">
        <button className="btn-icon" onClick={() => setSearchOpen(true)} title="Search (⌘K)">
          <Search size={16} />
        </button>
        <div className="user-pill">
          <div className="user-av">{user?.avatar || '?'}</div>
          <span className="user-name-top">{user?.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>
    </header>
  )
}

