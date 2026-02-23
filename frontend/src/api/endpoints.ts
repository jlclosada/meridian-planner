import { api } from './client'
import type {
  Task, Habit, CalendarEvent, Routine, Goal, Note,
  DashboardStats, User, AdminStats,
} from '@/types'

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  signup: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: User }>('/auth/signup', { email, password, name }),
  google: (token: string) =>
    api.post<{ token: string; user: User }>('/auth/google', { token }),
  me: () => api.get<User>('/auth/me'),
  updateMe: (data: Partial<User>) => api.patch<User>('/auth/me', data),
  logout: () => api.post('/auth/logout'),
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get<Task[]>(`/tasks${qs}`)
  },
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/tasks/${id}`),
  reorder: (items: { id: string; order: number; date?: string; time?: string }[]) =>
    api.post<{ ok: boolean }>('/tasks/reorder', items),
}

// ── Habits ───────────────────────────────────────────────────────────────────

export const habitsApi = {
  list: () => api.get<Habit[]>('/habits'),
  create: (data: Partial<Habit>) => api.post<Habit>('/habits', data),
  update: (id: string, data: Partial<Habit>) => api.patch<Habit>(`/habits/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/habits/${id}`),
  toggle: (id: string, date: string) =>
    api.post<Habit>(`/habits/${id}/toggle`, { date }),
}

// ── Events ───────────────────────────────────────────────────────────────────

export const eventsApi = {
  list: (month?: string) => {
    const qs = month ? `?month=${month}` : ''
    return api.get<CalendarEvent[]>(`/events${qs}`)
  },
  get: (id: string) => api.get<CalendarEvent>(`/events/${id}`),
  create: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/events', data),
  update: (id: string, data: Partial<CalendarEvent>) =>
    api.patch<CalendarEvent>(`/events/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/events/${id}`),
}

// ── Routines ─────────────────────────────────────────────────────────────────

export const routinesApi = {
  list: () => api.get<Routine[]>('/routines'),
  create: (data: Partial<Routine>) => api.post<Routine>('/routines', data),
  update: (id: string, data: Partial<Routine>) => api.patch<Routine>(`/routines/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/routines/${id}`),
}

// ── Goals ────────────────────────────────────────────────────────────────────

export const goalsApi = {
  list: () => api.get<Goal[]>('/goals'),
  get: (id: string) => api.get<Goal>(`/goals/${id}`),
  create: (data: Partial<Goal>) => api.post<Goal>('/goals', data),
  update: (id: string, data: Partial<Goal>) => api.patch<Goal>(`/goals/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/goals/${id}`),
}

// ── Notes ────────────────────────────────────────────────────────────────────

export const notesApi = {
  list: () => api.get<Note[]>('/notes'),
  create: (data: Partial<Note>) => api.post<Note>('/notes', data),
  update: (id: string, data: Partial<Note>) => api.patch<Note>(`/notes/${id}`, data),
  delete: (id: string) => api.delete<{ ok: boolean }>(`/notes/${id}`),
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard'),
}

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats'),
}

