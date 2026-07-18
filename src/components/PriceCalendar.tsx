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
      <div className="grid grid-cols-7 gap-1.5">
        {data.days.map((d) => (
          <div key={d.date} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
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
