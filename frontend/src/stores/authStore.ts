import { create } from 'zustand'
import type { User } from '@/types'
import { authApi } from '@/api/endpoints'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  tryAutoLogin: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('meridian_token'),
  loading: true,

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password)
    localStorage.setItem('meridian_token', token)
    set({ user, token, loading: false })
  },

  logout: () => {
    localStorage.removeItem('meridian_token')
    set({ user: null, token: null })
  },

  tryAutoLogin: async () => {
    const token = get().token
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const user = await authApi.me()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem('meridian_token')
      set({ user: null, token: null, loading: false })
    }
  },

  updateProfile: async (data) => {
    const user = await authApi.updateMe(data)
    set({ user })
  },
}))

