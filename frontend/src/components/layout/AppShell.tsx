import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageRouter from './PageRouter'
import TaskDetailModal from '@/components/modals/TaskDetailModal'
import EventDetailModal from '@/components/modals/EventDetailModal'
import SearchModal from '@/components/modals/SearchModal'
import { useAppStore } from '@/stores/appStore'
import { useEffect } from 'react'

export default function AppShell() {
  const { setSearchOpen } = useAppStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setSearchOpen])

  return (
    <div id="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="page-content">
          <PageRouter />
        </div>
      </main>
      <TaskDetailModal />
      <EventDetailModal />
      <SearchModal />
    </div>
  )
}

