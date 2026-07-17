import { useState } from 'react'
import type { CountryCode } from 'libphonenumber-js/min'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Footer } from '../components/Footer'
import { PhoneInput } from '../components/PhoneInput'
import { useToast } from '../context/ToastContext'
import { submitToSheet } from '../lib/backend'
import { usePageMeta } from '../hooks/usePageMeta'

const SUPPORT_EMAIL = 'innblysupport@gmail.com'

export function ContactPage() {
  usePageMeta('Contact Us', 'Get in touch with the innbly team for questions about a stay, a listing, or partnering with us.')
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('IN')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitToSheet('contact', { name, email, phone, message })
    setSent(true)
    showToast('Message sent! We will get back to you shortly.')
  }

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            Get In Touch
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl font-medium text-slate-500">
            Questions about a stay, a listing, or partnering with us? Reach out — our team typically replies within
            one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:border-primary-200"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Email us</p>
                <p className="text-sm text-slate-500">{SUPPORT_EMAIL}</p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Call support</p>
                <p className="text-sm text-slate-500">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Head office</p>
                <p className="text-sm text-slate-500">Koramangala, Bengaluru, India</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:p-8">
              {sent ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                    <Send className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Message sent!</h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    Thanks for reaching out, {name.split(' ')[0] || 'there'}. We'll reply to {email} soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Phone (optional)
                    </label>
                    <PhoneInput value={phone} onChange={setPhone} country={phoneCountry} onCountryChange={setPhoneCountry} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-500/10 transition-all hover:bg-primary-700 active:scale-95"
                  >
                    <Send className="h-4 w-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
