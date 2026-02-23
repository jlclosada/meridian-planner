import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard, Sun, CalendarDays, CalendarRange, CheckSquare,
  Repeat, Target, Scroll, StickyNote, ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'
import './Sidebar.css'

type Page = 'dashboard' | 'today' | 'week' | 'month' | 'tasks' | 'habits' | 'goals' | 'routines' | 'notes' | 'admin'

const NAV_ITEMS: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'today', label: 'Today', icon: Sun },
  { page: 'week', label: 'Week', icon: CalendarDays },
  { page: 'month', label: 'Month', icon: CalendarRange },
  { page: 'tasks', label: 'All Tasks', icon: CheckSquare },
  { page: 'habits', label: 'Habits', icon: Repeat },
  { page: 'goals', label: 'Goals', icon: Target },
  { page: 'routines', label: 'Routines', icon: Scroll },
  { page: 'notes', label: 'Notes', icon: StickyNote },
]

export default function Sidebar() {
  const { currentPage, navigate } = useAppStore()
  const { user } = useAuthStore()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◇</span>
        <span className="brand-text">Meridian</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            className={clsx('nav-item', currentPage === page && 'active')}
            onClick={() => navigate(page)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-divider" />
            <button
              className={clsx('nav-item', currentPage === 'admin' && 'active')}
              onClick={() => navigate('admin')}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.avatar || '?'}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

