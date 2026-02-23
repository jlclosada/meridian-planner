import { create } from 'zustand'

type Page = 'dashboard' | 'today' | 'week' | 'month' | 'tasks' | 'habits' | 'goals' | 'routines' | 'notes' | 'admin' | 'profile'

interface AppState {
  currentPage: Page
  sidebarOpen: boolean
  searchOpen: boolean
  viewDate: Date
  weekStart: Date
  monthDate: Date
  navigate: (page: Page) => void
  toggleSidebar: () => void
  setSearchOpen: (open: boolean) => void
  setViewDate: (date: Date) => void
  setWeekStart: (date: Date) => void
  setMonthDate: (date: Date) => void
}

function getWeekStart(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  searchOpen: false,
  viewDate: new Date(),
  weekStart: getWeekStart(new Date()),
  monthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),

  navigate: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setViewDate: (date) => set({ viewDate: date }),
  setWeekStart: (date) => set({ weekStart: date }),
  setMonthDate: (date) => set({ monthDate: date }),
}))

