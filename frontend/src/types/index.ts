// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  timezone: string
  created_at: string
  theme: string
  week_start: string
  role: 'user' | 'admin'
}

export interface ChecklistItem {
  text: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  category: Category
  priority: Priority
  status: TaskStatus
  done: boolean
  date: string | null
  time: string | null
  duration: number
  color: string
  tags: string[]
  notes: string
  checklist: ChecklistItem[]
  recurring: string | null
  order: number
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  category: string
  target_days: string
  completions: string[]
  reminder: string | null
  streak: number
  best_streak: number
}

export interface CalendarEvent {
  id: string
  title: string
  category: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  color: string
  all_day: boolean
  notes: string
  location: string
}

export interface Routine {
  id: string
  name: string
  icon: string
  time: string
  days: string
  color: string
  steps: string[]
  duration: number
  active: boolean
}

export interface Milestone {
  text: string
  done: boolean
}

export interface Goal {
  id: string
  title: string
  category: string
  color: string
  target_date: string
  progress: number
  milestones: Milestone[]
  notes: string
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  today: {
    date: string
    tasks_total: number
    tasks_done: number
    tasks_pending: number
    completion_rate: number
  }
  habits: {
    due_today: number
    done_today: number
    rate: number
    top_streak: string | null
    top_streak_days: number
  }
  goals: {
    total: number
    avg_progress: number
  }
  weekly: Record<string, { total: number; done: number; habits: number }>
  week_completion: number
  category_breakdown: Record<string, number>
  backlog_count: number
}

export type Category = 'work' | 'health' | 'learning' | 'personal'
export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked'

export interface AdminStats {
  users: number
  tasks: number
  habits: number
  goals: number
  notes: number
  sessions: number
  user_list: { id: string; name: string; email: string; role: string }[]
}

