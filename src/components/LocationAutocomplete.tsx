import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { properties } from '../data/properties'

const SUGGESTIONS = Array.from(
  new Set(properties.flatMap((p) => [p.city, `${p.neighborhood}, ${p.city}`])),
).sort()

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LocationAutocomplete({ value, onChange, placeholder }: LocationAutocompleteProps) {
  const [focused, setFocused] = useState(false)

  const matches = useMemo(() => {
    if (!value.trim()) return SUGGESTIONS.slice(0, 6)
    const q = value.toLowerCase()
    return SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 6)
  }, [value])

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder ?? 'Area / City'}
        className="w-full cursor-text bg-transparent text-[15px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
      />
      {focused && matches.length > 0 && (
        <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-card-hover">
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(s)
                setFocused(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
