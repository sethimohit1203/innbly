import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, UserRole } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  sessionLoading: boolean
  isModalOpen: boolean
  pendingRole: UserRole
  openAuthModal: (role?: UserRole) => void
  closeAuthModal: () => void
  login: (user: AuthUser) => void
  logout: () => void
  switchRole: () => Promise<AuthUser | null>
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatarUrl'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Real session-backed auth (see api/auth.ts) — the httpOnly session cookie
 * is the source of truth, not localStorage, so `user` is hydrated from
 * GET /api/auth?action=session on mount rather than read synchronously. A
 * signed-out visitor simply gets a 401 here, which resolves to `user: null`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [isModalOpen, setModalOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<UserRole>('tenant')

  useEffect(() => {
    fetch('/api/auth?action=session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setSessionLoading(false))
  }, [])

  const logout = () => {
    setUser(null)
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {})
  }

  const switchRole = async (): Promise<AuthUser | null> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch-role' }),
    })
    if (!res.ok) return null
    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const updateProfile = (patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'avatarUrl'>>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev))
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-profile', ...patch }),
    }).catch(() => {})
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionLoading,
        isModalOpen,
        pendingRole,
        openAuthModal: (role) => {
          setPendingRole(role ?? 'tenant')
          setModalOpen(true)
        },
        closeAuthModal: () => setModalOpen(false),
        login: (u) => {
          setUser(u)
          setModalOpen(false)
        },
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
