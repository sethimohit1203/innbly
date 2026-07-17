import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function HostOnlyRoute({ children }: { children: ReactNode }) {
  const { user, openAuthModal } = useAuth()
  const { showToast } = useToast()
  const isHost = user?.role === 'host'

  useEffect(() => {
    if (!isHost) {
      showToast(user ? 'This area is for hosts only.' : 'Sign in as a host to view the dashboard.', 'error')
      if (!user) openAuthModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isHost) return <Navigate to="/" replace />

  return <>{children}</>
}
