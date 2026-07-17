import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  isModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)

  return (
    <AuthContext.Provider
      value={{
        user,
        isModalOpen,
        openAuthModal: () => setModalOpen(true),
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
