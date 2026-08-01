import { useState } from 'react'
import { Link } from '~links'
import { Instagram, Facebook, Youtube, Send, Twitter } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { submitToSheet } from '../lib/backend'

export function Footer() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const result = await submitToSheet('newsletter', { email })
    if (!result.ok) {
      showToast(result.error ?? 'Could not subscribe. Please try again.', 'error')
      return
    }
    showToast('Subscribed! We will notify you of openings.')
    setEmail('')
  }

  return (
    <footer className="border-t border-slate-150 bg-white pb-8 pt-16 text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-100 pb-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src="/brand/innbly-icon.jpg" alt="innbly" className="h-9 w-9 rounded-xl object-cover" />
              <span className="text-xl font-extrabold tracking-tight text-primary-600">innbly</span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              India's trusted vacation rental network — verified villas, holiday homes, cabins and more.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Innbly on Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-primary-500 hover:text-primary-600"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Innbly on Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-primary-500 hover:text-primary-600"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Innbly on Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-primary-500 hover:text-primary-600"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Innbly on YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-primary-500 hover:text-primary-600"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-900">Destinations</h4>
            <ul className="space-y-3 text-sm font-medium">
              {[
                ['Goa', '/goa'],
                ['Manali', '/manali'],
                ['Shimla', '/shimla'],
                ['Jaipur', '/jaipur'],
                ['Kerala', '/kerala'],
              ].map(([city, path]) => (
                <li key={city}>
                  <Link to={path} className="transition-colors hover:text-primary-600 text-slate-500">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/enterprise" className="transition-colors hover:text-primary-600 text-slate-500">About innbly</Link></li>
              <li><a href="#" className="transition-colors hover:text-primary-600 text-slate-500">Careers</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-600 text-slate-500">Blog</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-600 text-slate-500">Press</a></li>
              <li><Link to="/contact" className="transition-colors hover:text-primary-600 text-slate-500">Contact Us</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-900">Help & Support</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/dashboard" className="transition-colors hover:text-primary-600 text-slate-500">Host Dashboard</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-primary-600 text-slate-500">Contact Support</Link></li>
              <li><Link to="/terms" className="transition-colors hover:text-primary-600 text-slate-500">Cancellation Policy</Link></li>
              <li><Link to="/privacy-policy" className="transition-colors hover:text-primary-600 text-slate-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition-colors hover:text-primary-600 text-slate-500">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="space-y-6">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Stay Updated</h4>
            <p className="text-sm font-medium text-slate-500">
              Get notified when new verified stays open in your favorite destinations.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 relative max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-4 pr-12 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary-500 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition hover:bg-primary-700 active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-8 text-xs font-semibold text-slate-400">
          <p>© 2024 innbly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
