import { useState } from 'react'
import { X, Home as HomeIcon, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { submitToSheet } from '../lib/backend'
import { GoogleSignInButton } from './GoogleSignInButton'
import type { UserRole } from '../types'

export function AuthModal() {
  const { isModalOpen, closeAuthModal, login } = useAuth()
  const { showToast } = useToast()
  const [role, setRole] = useState<UserRole | null>(null)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isModalOpen) return null

  const reset = () => {
    setRole(null)
    setName('')
    setEmail('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role || submitting) return

    const finalName = name || 'Guest User'
    const finalEmail = email || 'guest@innbly.com'

    setSubmitting(true)
    const result = await submitToSheet('signup', { name: finalName, email: finalEmail, role, method: 'email' })
    setSubmitting(false)

    if (!result.ok) {
      showToast(result.error ?? 'Could not sign you up. Please try again.', 'error')
      return
    }

    login({ name: finalName, email: finalEmail, role })
    reset()
  }

  const handleGoogleSuccess = async (profile: { name: string; email: string }) => {
    if (!role) {
      showToast('Pick "Rent a Space" or "List My Property" first', 'error')
      return
    }

    setSubmitting(true)
    const result = await submitToSheet('signup', { name: profile.name, email: profile.email, role, method: 'google' })
    setSubmitting(false)

    if (!result.ok) {
      showToast(result.error ?? 'Could not sign you up. Please try again.', 'error')
      return
    }

    login({ name: profile.name, email: profile.email, role })
    showToast(`Welcome, ${profile.name.split(' ')[0]}!`)
    reset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={() => {
            closeAuthModal()
            reset()
          }}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900">
          {mode === 'signup' ? 'Join innbly' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'signup' ? 'Tell us who you are to get started.' : 'Log in to continue.'}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole('tenant')}
            className={`group flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition ${
              role === 'tenant'
                ? 'border-primary-500 bg-primary-50 shadow-card'
                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
            }`}
          >
            <HomeIcon className={`h-8 w-8 ${role === 'tenant' ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
            <span className="font-semibold text-slate-800">I want to Rent a Space</span>
            <span className="text-xs text-slate-500">Find PGs, coliving & rentals</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('host')}
            className={`group flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition ${
              role === 'host'
                ? 'border-accent-500 bg-accent-50 shadow-card'
                : 'border-slate-200 hover:border-accent-300 hover:bg-slate-50'
            }`}
          >
            <Building2 className={`h-8 w-8 ${role === 'host' ? 'text-accent-600' : 'text-slate-400 group-hover:text-accent-500'}`} />
            <span className="font-semibold text-slate-800">I want to List My Property</span>
            <span className="text-xs text-slate-500">Reach verified tenants fast</span>
          </button>
        </div>

        <div className="mt-6">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or continue with email
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={!role || submitting}
            className="w-full rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="font-semibold text-primary-600 hover:underline"
          >
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
