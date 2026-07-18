import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export function StickyHomeSearchBar({ onSearchClick }: { onSearchClick: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`sticky top-20 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all duration-200 ${
        visible ? 'max-h-20 py-3 opacity-100' : 'pointer-events-none max-h-0 overflow-hidden py-0 opacity-0'
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4">
        <button
          onClick={onSearchClick}
          className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:shadow-md"
        >
          <Search className="h-4 w-4 text-primary-600" />
          Where are you headed? Search stays…
        </button>
      </div>
    </div>
  )
}
