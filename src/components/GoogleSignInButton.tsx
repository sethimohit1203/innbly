import { useEffect, useRef } from 'react'
import { decodeGoogleCredential, type GoogleProfile } from '../lib/googleAuth'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function GoogleSignInButton({ onSuccess }: { onSuccess: (profile: GoogleProfile) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return

    let cancelled = false
    const tryInit = () => {
      if (cancelled || !ref.current) return
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 200)
        return
      }
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          const profile = decodeGoogleCredential(response.credential)
          if (profile) onSuccess(profile)
        },
      })
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        shape: 'pill',
      })
    }
    tryInit()
    return () => {
      cancelled = true
    }
  }, [onSuccess])

  if (!CLIENT_ID) {
    return (
      <div
        title="Set VITE_GOOGLE_CLIENT_ID in .env to enable Google Sign-In"
        className="flex w-full cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400"
      >
        Continue with Google (not configured)
      </div>
    )
  }

  return <div ref={ref} className="flex w-full justify-center" />
}
