import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  role: string | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,

      setAuth: (token, user) => {
        localStorage.setItem('lavoto_token', token)
        set({
          token,
          user,
          isAuthenticated: true,
          role: user.roles?.[0] ?? null,
        })
      },

      setUser: (user) =>
        set({ user, role: user.roles?.[0] ?? null }),

      clearAuth: () => {
        localStorage.removeItem('lavoto_token')
        set({ token: null, user: null, isAuthenticated: false, role: null })
      },
    }),
    {
      name: 'lavoto_auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
)
