import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DISMISS_KEY = 'innbly_banner_dismissed'

export function TopBanner() {
  const { user, openAuthModal } = useAuth()
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1')

  if (user || dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="relative flex items-center justify-center gap-3 bg-stone-950 px-4 py-2.5 text-center text-sm font-semibold text-white">
      <Sparkles className="hidden h-4 w-4 shrink-0 text-accent-400 sm:block" />
      <span>
        Sign in and save 10% or more with a free innbly membership.{' '}
        <button onClick={openAuthModal} className="font-extrabold text-accent-400 underline underline-offset-2 hover:text-accent-300">
          Sign in now
        </button>
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
