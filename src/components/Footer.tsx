import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, Twitter, Linkedin, Instagram, Send } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export function Footer() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    showToast('Subscribed! We will notify you of openings.')
    setEmail('')
  }

  return (
    <footer className="border-t border-slate-800 bg-stone-950 pb-8 pt-16 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-slate-800 pb-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <HomeIcon className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">innbly</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-slate-400">
              India's most trusted premium co-living network. Redefining modern stays and private homestays with
              total price transparency.
            </p>
            <div className="flex items-center gap-3 text-white">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-primary-600">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-primary-600">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-primary-600">
                <Instagram className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Our Cities</h4>
            <ul className="space-y-3 text-sm font-medium">
              {['Delhi NCR', 'Mumbai', 'Bangalore', 'Pune'].map((city) => (
                <li key={city}>
                  <Link to="/search" className="transition-colors hover:text-white">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Help & Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/search" className="transition-colors hover:text-white">Schedule Visit</Link></li>
              <li><Link to="/dashboard" className="transition-colors hover:text-white">Host Dashboard</Link></li>
              <li><a href="#" className="transition-colors hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Contact Support</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">Stay Updated</h4>
            <p className="text-sm font-medium text-slate-400">
              Get notifications when verified rooms open in your preferred zones.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-primary-500"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 shadow-lg transition-all hover:bg-primary-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs font-semibold text-slate-500 sm:flex-row">
          <p>© 2026 innbly Premium Stays. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-slate-400">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
