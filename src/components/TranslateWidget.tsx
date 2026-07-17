import { useEffect, useRef, useState } from 'react'
import { Languages } from 'lucide-react'
import '../lib/googleAuth'

let scriptLoading = false

export function TranslateWidget() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!open || initialized.current) return
    initialized.current = true

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'google_translate_element',
        )
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
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Translate this page"
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-primary-600"
      >
        <Languages className="h-4.5 w-4.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-card-hover">
            <p className="mb-2 text-xs font-semibold text-slate-500">Translate this page</p>
            <div id="google_translate_element" className="notranslate text-sm" />
          </div>
        </>
      )}
    </div>
  )
}
