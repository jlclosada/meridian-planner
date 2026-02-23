import { format, isToday, isTomorrow, addDays, startOfWeek } from 'date-fns'
import type { Category, Priority, TaskStatus } from '@/types'

export function formatDate(date: string): string {
  return format(new Date(date + 'T12:00:00'), 'MMM d, yyyy')
}

export function formatDateShort(date: string): string {
  return format(new Date(date + 'T12:00:00'), 'MMM d')
}

export function formatDateLabel(date: string | null, time?: string | null): string {
  if (!date) return 'Backlog'
  const d = new Date(date + 'T12:00:00')
  let label = isToday(d) ? 'Today' : isTomorrow(d) ? 'Tomorrow' : formatDate(date)
  if (time) label += ` at ${time}`
  return label
}

export function toDateString(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function todayString(): string {
  return toDateString(new Date())
}

export function getWeekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 })
}

export function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  work: '💼 Work',
  health: '💚 Health',
  learning: '📚 Learning',
  personal: '🌟 Personal',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  work: '#3B5EA6',
  health: '#5C7A6A',
  learning: '#7B4F8A',
  personal: '#B8860B',
}

export function getCategoryClass(cat: string): string {
  return `tag-${cat}`
}

export function getStatusClass(status: TaskStatus): string {
  return `status-${status}`
}

export function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

