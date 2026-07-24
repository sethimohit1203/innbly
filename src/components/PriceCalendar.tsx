import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useServerPrice } from '../hooks/useServerPrice'

interface CalendarDay {
  date: string
  label: string
  price: number
}

export function PriceCalendar({ propertyId }: { propertyId: string }) {
  const request = useMemo(() => ({ kind: 'calendar', propertyId }), [propertyId])
  const fallback = useMemo(() => ({ days: [] as CalendarDay[] }), [])
  const { data, loading, error } = useServerPrice<{ days: CalendarDay[] }>({ request, fallback })

  if (error) return null

  const prices = data.days.map((d) => d.price)
  const maxPrice = Math.max(...prices, 0)

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {loading && <Loader2 className="h-3 w-3 animate-spin" />} Next 7 nights
      </div>
      {/* Horizontally scrollable on narrow screens instead of forcing 7 cramped
          columns into a card that can be as narrow as the phone itself — snaps
          back to an even 7-column grid once there's room for it. */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin sm:grid sm:grid-cols-7 sm:overflow-visible">
        {data.days.map((d) => (
          <div
            key={d.date}
            className="min-w-[60px] shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center sm:min-w-0 sm:shrink"
          >
            <p className="text-[10px] font-bold uppercase text-slate-400">{d.label}</p>
            <p className={`mt-1 text-xs font-extrabold ${d.price === maxPrice && maxPrice > 0 ? 'text-accent-700' : 'text-slate-800'}`}>
              ₹{d.price.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
