import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, UserRole } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  isModalOpen: boolean
  pendingRole: UserRole
  openAuthModal: (role?: UserRole) => void
  closeAuthModal: () => void
  login: (user: AuthUser) => void
  logout: () => void
}

const STORAGE_KEY = 'innbly_auth_user'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  })
  const [isModalOpen, setModalOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<UserRole>('tenant')

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable (e.g. private browsing) — session just won't persist.
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
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
        logout: () => setUser(null),
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
