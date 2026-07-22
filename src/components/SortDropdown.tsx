import { useState } from 'react'
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react'

export type SortOption = 'recommended' | 'rating' | 'price-low' | 'price-high' | 'luxury'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Lowest Price' },
  { value: 'price-high', label: 'Highest Price' },
  { value: 'luxury', label: 'Luxury First' },
]

export function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const current = OPTIONS.find((o) => o.value === value)!

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300"
      >
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
        {current.label}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-card-hover">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {o.label}
                {o.value === value && <Check className="h-3.5 w-3.5 text-primary-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
