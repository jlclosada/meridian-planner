import React from 'react'
import { useAppStore } from '@/stores/appStore'
import DashboardPage from '@/pages/DashboardPage'
import TodayPage from '@/pages/TodayPage'
import WeekPage from '@/pages/WeekPage'
import MonthPage from '@/pages/MonthPage'
import TasksPage from '@/pages/TasksPage'
import HabitsPage from '@/pages/HabitsPage'
import GoalsPage from '@/pages/GoalsPage'
import RoutinesPage from '@/pages/RoutinesPage'
import NotesPage from '@/pages/NotesPage'
import AdminPage from '@/pages/AdminPage'
import ProfilePage from '@/pages/ProfilePage'

const PAGES: Record<string, React.FC> = {
  dashboard: DashboardPage,
  today: TodayPage,
  week: WeekPage,
  month: MonthPage,
  tasks: TasksPage,
  habits: HabitsPage,
  goals: GoalsPage,
  routines: RoutinesPage,
  notes: NotesPage,
  admin: AdminPage,
  profile: ProfilePage,
}

export default function PageRouter() {
  const { currentPage } = useAppStore()
  const Page = PAGES[currentPage] || DashboardPage
  return <Page />
}

