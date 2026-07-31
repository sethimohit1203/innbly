import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/** Gates /dashboard routes to logged-in hosts. Must wait for `sessionLoading`
 * to resolve before deciding anything — `user` starts out `null` while the
 * session cookie is still being verified against GET /api/auth?action=session,
 * so checking it before that resolves incorrectly treats every fresh page
 * load (e.g. a link opened in a new tab) as signed-out, redirecting an
 * already-logged-in host and popping the sign-in modal on top of it. */
export function HostOnlyRoute({ children }: { children: ReactNode }) {
  const { user, sessionLoading, openAuthModal } = useAuth()
  const { showToast } = useToast()
  const isHost = user?.role === 'host'

  useEffect(() => {
    if (sessionLoading) return
    if (!isHost) {
      showToast(user ? 'This area is for hosts only.' : 'Sign in as a host to view the dashboard.', 'error')
      if (!user) openAuthModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading])

  if (sessionLoading) return null
  if (!isHost) return <Navigate to="/" replace />

  return <>{children}</>
}
