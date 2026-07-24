import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Copy, Check, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function InvitePage() {
  usePageMeta('Invite Friends', 'Share innbly with friends and family.')
  const { user, openAuthModal } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign in to invite friends</h1>
        <button
          onClick={() => openAuthModal()}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
        >
          Sign In / Sign Up
        </button>
      </div>
    )
  }

  const referralLink = `${window.location.origin}/?ref=${encodeURIComponent(user.email)}`
  const shareText = `I've been using innbly to find verified stays — check it out: ${referralLink}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard permission denied — the link is still visible to select manually.
    }
  }

  return (
    <>
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <Gift className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Invite Friends to innbly</h1>
        <p className="mt-2 text-sm text-slate-500">
          Share your personal link — anyone who opens it lands on innbly ready to explore.
        </p>

        <div className="mt-8 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
          <input
            readOnly
            value={referralLink}
            className="flex-1 truncate bg-transparent px-3 py-2 text-sm text-slate-600 outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
          >
            Share on WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent('Check out innbly')}&body=${encodeURIComponent(shareText)}`}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
          >
            Share via Email
          </a>
        </div>

        <Link to="/profile" className="mt-8 inline-block text-sm font-semibold text-primary-600 hover:underline">
          ← Back to Profile
        </Link>
      </section>
      <Footer />
    </>
  )
}
