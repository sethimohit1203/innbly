import { useState } from 'react'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePageMeta } from '../../hooks/usePageMeta'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

/** A real, working invite — it sends an actual email to the co-host (via
 * api/submit.ts's coHostInvite type, forwarded through the existing Google
 * Apps Script pipeline, same as every other email this app sends). There's
 * no in-app shared-permission/co-management system behind it yet, so this
 * doesn't pretend one exists — it's an introduction email, not a full
 * co-host account. */
export function HostCoHostPage() {
  usePageMeta('Find a Co-Host', 'Invite someone to help manage your innbly listings.')
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email || !email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'coHostInvite',
          hostEmail: user.email,
          coHostEmail: email.trim(),
          coHostName: name.trim(),
          message: message.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Could not send the invite.')
      }
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md rounded-2xl border border-accent-200 bg-accent-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent-600" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">Invite sent</h2>
        <p className="mt-1 text-sm text-slate-600">{email} should receive an email from innbly shortly.</p>
        <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setName(''); setEmail(''); setMessage('') }}>
          Invite someone else
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Find a co-host</h2>
          <p className="text-sm text-slate-500">Invite someone to help manage your listings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <Input label="Their name (optional)" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
        <Input
          label="Their email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cohost@example.com"
        />
        <div>
          <label className="text-input-label mb-1.5 block text-slate-700">Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Let them know what you'd like help with…"
            className="w-full rounded-control border border-slate-300 px-4 py-3 text-body text-slate-900 outline-none transition-all duration-200 ease-smooth placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </div>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <Button type="submit" loading={submitting} className="w-full">
          Send invite
        </Button>
        <p className="text-xs text-slate-400">
          This sends an introduction email — co-hosts don't yet get shared dashboard access, that's coming later.
        </p>
      </form>
    </div>
  )
}
