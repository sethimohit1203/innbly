import { useEffect, useState } from 'react'
import { Languages } from 'lucide-react'
import '../../lib/googleAuth'
import { usePageMeta } from '../../hooks/usePageMeta'

const CURRENCY_STORAGE_KEY = 'innbly_display_currency'

// Approximate, informational-only conversion — every real price on this
// site is computed server-side in INR (see src/hooks/useServerPrice.ts and
// CLAUDE.md's "Pricing is server-authoritative" note); this page doesn't
// touch that path. It just lets a host preview roughly what a nightly rate
// looks like in another currency, clearly labelled as an estimate.
const CURRENCIES: { code: string; label: string; rateFromInr: number }[] = [
  { code: 'INR', label: '₹ Indian Rupee', rateFromInr: 1 },
  { code: 'USD', label: '$ US Dollar', rateFromInr: 1 / 83 },
  { code: 'EUR', label: '€ Euro', rateFromInr: 1 / 90 },
  { code: 'GBP', label: '£ British Pound', rateFromInr: 1 / 105 },
]

let scriptLoading = false

export function HostLanguagesPage() {
  usePageMeta('Languages & Currency', 'Set your preferred display language and currency.')

  const [currency, setCurrency] = useState(() => localStorage.getItem(CURRENCY_STORAGE_KEY) ?? 'INR')

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  }, [currency])

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element_settings')
      }
    }
    if (!document.getElementById('google-translate-script') && !scriptLoading) {
      scriptLoading = true
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    } else if (window.google?.translate) {
      window.googleTranslateElementInit()
    }
  }, [])

  const selected = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]
  const sampleInr = 4200
  const converted = Math.round(sampleInr * selected.rateFromInr)

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="mb-1 text-xl font-bold text-slate-900">Languages & Currency</h2>
        <p className="text-sm text-slate-500">Set how innbly displays for you.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
          <Languages className="h-4 w-4 text-primary-600" /> Page language
        </h3>
        <p className="mb-3 text-sm text-slate-500">Translate innbly into your preferred language, powered by Google Translate.</p>
        <div id="google_translate_element_settings" className="notranslate" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="mb-1 font-semibold text-slate-800">Display currency</h3>
        <p className="mb-3 text-sm text-slate-500">
          Every price on innbly is billed in Indian Rupees — this only changes how amounts are previewed for you.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                currency === c.code ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Example: a ₹{sampleInr.toLocaleString('en-IN')}/night listing is roughly{' '}
          <span className="font-bold text-slate-900">
            {selected.code === 'INR' ? `₹${converted.toLocaleString('en-IN')}` : `${selected.code} ${converted.toLocaleString('en-IN')}`}
          </span>
          .
        </p>
      </section>
    </div>
  )
}
