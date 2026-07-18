import { Minus, Plus, Users } from 'lucide-react'

interface GuestCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function GuestCounter({ value, onChange, min = 1, max = 10 }: GuestCounterProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Users className="h-4 w-4 text-slate-400" /> Guests
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-4 text-center text-sm font-bold text-slate-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
