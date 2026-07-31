import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Building2, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GoogleSignInButton } from './GoogleSignInButton'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import type { UserRole } from '../types'

type Step = 'form' | 'otp' | 'community'

async function callAuth(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export function AuthModal() {
  const { isModalOpen, pendingRole, closeAuthModal, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState<UserRole>('tenant')
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [step, setStep] = useState<Step>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [password, setPassword] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<{ name: string; email: string; role: UserRole } | null>(null)

  useEffect(() => {
    if (isModalOpen) setRole(pendingRole)
  }, [isModalOpen, pendingRole])

  if (!isModalOpen) return null

  const reset = () => {
    setRole('tenant')
    setMode('signup')
    setStep('form')
    setName('')
    setEmail('')
    setDob('')
    setPassword('')
    setOtpDigits(['', '', '', '', '', ''])
    setError(null)
    setPendingUser(null)
  }

  const finishLogin = (user: { name: string; email: string; role: UserRole }) => {
    login(user)
    reset()
    if (user.role === 'host') navigate('/dashboard/list-property')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        const { ok, data } = await callAuth('login', { email, password })
        if (!ok) {
          setError(data.error ?? 'Could not log in.')
          return
        }
        showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`)
        finishLogin(data.user)
      } else {
        const { ok, data } = await callAuth('signup', { name, email, password, dob })
        if (!ok) {
          setError(data.error ?? 'Could not create your account.')
          return
        }
        setPendingUser({ name, email, role })
        setStep('otp')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus()
  }

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('')
    if (code.length !== 6 || !pendingUser) return
    setError(null)
    setSubmitting(true)
    try {
      const { ok, data } = await callAuth('verify-otp', { email: pendingUser.email, code })
      if (!ok) {
        setError(data.error ?? 'Incorrect code.')
        return
      }
      setPendingUser(data.user)
      setStep('community')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingUser) return
    setError(null)
    const { ok, data } = await callAuth('resend-otp', { email: pendingUser.email })
    showToast(ok ? 'A new code is on its way.' : (data.error ?? 'Could not resend the code.'), ok ? 'success' : 'error')
  }

  const handleAgreeCommunity = () => {
    if (!pendingUser) return
    showToast(`Welcome, ${pendingUser.name.split(' ')[0]}!`)
    finishLogin(pendingUser)
  }

  const handleGoogleSuccess = async (profile: { name: string; email: string }) => {
    setSubmitting(true)
    try {
      const { ok, data } = await callAuth('google-auth', { name: profile.name, email: profile.email })
      if (!ok) {
        showToast(data.error ?? 'Could not sign in with Google.', 'error')
        return
      }
      showToast(`Welcome, ${profile.name.split(' ')[0]}!`)
      finishLogin({ ...data.user, role })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            closeAuthModal()
            reset()
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </Button>

        {step === 'form' && (
          <>
            <h2 className="text-card-heading text-slate-900">
              {mode === 'signup' ? "Let's create your account" : 'Log in'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'signup' ? 'This information is required to book or host.' : 'Welcome back to innbly.'}
            </p>

            <button
              type="button"
              onClick={() => setRole((r) => (r === 'host' ? 'tenant' : 'host'))}
              className={`mt-6 flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ease-smooth ${
                role === 'host'
                  ? 'border-accent-500 bg-accent-50'
                  : 'border-dashed border-slate-200 hover:border-accent-300 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <Building2 className={`h-6 w-6 ${role === 'host' ? 'text-accent-600' : 'text-slate-400'}`} />
                <span>
                  <span className="block font-semibold text-slate-800">List a property instead</span>
                  <span className="block text-xs text-slate-500">Become a host and reach verified tenants</span>
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  role === 'host' ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {role === 'host' ? 'Hosting' : 'Off'}
              </span>
            </button>

            <div className="mt-6">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} />
            </div>

            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              or continue with email
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              {mode === 'signup' && (
                <Input
                  label="Legal name"
                  type="text"
                  required
                  placeholder="Full name (as on your government ID)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {mode === 'signup' && (
                <Input
                  label="Date of birth"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              )}
              <Input
                type="password"
                required
                minLength={8}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={mode === 'signup' ? error ?? undefined : undefined}
              />
              {mode === 'login' && error && <p className="text-xs font-medium text-rose-600">{error}</p>}
              <Button type="submit" variant="secondary" size="lg" loading={submitting} className="w-full">
                {mode === 'signup' ? 'Agree and continue' : 'Log in'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup')
                  setError(null)
                }}
                className="font-semibold text-primary-600 hover:underline"
              >
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </>
        )}

        {step === 'otp' && pendingUser && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <KeyRound className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-4 text-card-heading text-slate-900">Confirm it's you</h2>
            <p className="mt-1 text-sm text-slate-500">We sent a code to {pendingUser.email}.</p>

            <div className="mt-6 flex justify-center gap-2">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-14 w-11 rounded-control border border-slate-300 text-center text-lg font-bold outline-none transition-all duration-200 ease-smooth focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
              ))}
            </div>

            {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

            <Button
              onClick={handleVerifyOtp}
              disabled={otpDigits.join('').length !== 6}
              loading={submitting}
              size="lg"
              className="mt-6 w-full"
            >
              Confirm
            </Button>
            <button onClick={handleResendOtp} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">
              Didn't get it? Send a new code
            </button>
          </div>
        )}

        {step === 'community' && pendingUser && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-2xl">
              🏡
            </div>
            <h2 className="mt-4 text-card-heading text-slate-900">Everyone belongs here</h2>
            <p className="mt-4 text-sm text-slate-600">
              When you join innbly, we ask you to agree to our{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">
                Community Commitment
              </a>
              :
            </p>
            <p className="mt-3 text-sm text-slate-600">
              I will treat everyone in the community — regardless of their race, religion, national
              origin, ethnicity, skin colour, disability, sex, gender identity, sexual orientation or
              age — with respect and without judgement or bias.
            </p>
            <Button
              onClick={handleAgreeCommunity}
              size="lg"
              className="mt-6 w-full bg-gradient-to-r from-primary-600 to-accent-500 hover:shadow-card-hover"
            >
              Agree and continue
            </Button>
            <button
              onClick={() => {
                closeAuthModal()
                reset()
              }}
              className="mt-3 text-sm font-semibold text-slate-400 hover:text-slate-600"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
