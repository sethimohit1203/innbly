import { useState } from 'react'
import { Star, BadgeCheck } from 'lucide-react'
import { properties } from '../../data/properties'
import { PriceMap } from '../../components/enterprise/PriceMap'
import { BookingDrawer } from '../../components/enterprise/BookingDrawer'
import { usePageMeta } from '../../hooks/usePageMeta'

export function EnterpriseSearchPage() {
  usePageMeta('Booking Engine — Live Availability', 'Browse live availability and instant pricing across your portfolio.')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeProperty = properties.find((p) => p.id === activeId) ?? null

  return (
    <section className="flex h-[calc(100vh-80px)] flex-col overflow-hidden">
      <h1 className="sr-only">Booking engine live availability</h1>
      <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <p className="text-sm font-bold text-slate-900">Live Availability</p>
        <p className="text-xs font-semibold text-slate-500">{properties.length} properties across your portfolio</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full overflow-y-auto px-4 py-5 scrollbar-thin sm:px-6 lg:w-[60%]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {properties.map((p) => (
              <button
                key={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setActiveId(p.id)}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  hoveredId === p.id || activeId === p.id ? 'border-stone-950 ring-2 ring-stone-900/10' : 'border-slate-100'
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-slate-900 shadow-sm">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating.toFixed(2)}
                  </span>
                  {p.verified && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-accent-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{p.city}</span>
                    <span>{p.tenantPreference}</span>
                  </div>
                  <h3 className="line-clamp-1 text-sm font-extrabold text-slate-800">{p.title}</h3>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                    <div>
                      <span className="text-base font-extrabold text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
                      <span className="block text-[10px] font-semibold text-slate-400">/ month</span>
                    </div>
                    <span className="rounded-lg bg-primary-50 px-3 py-2 text-[11px] font-bold text-primary-700 transition group-hover:bg-primary-100">
                      Explore / Book
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 border-l border-slate-200 p-4 lg:block lg:w-[40%]">
          <PriceMap
            listings={properties}
            hoveredId={hoveredId}
            activeId={activeId}
            onHover={setHoveredId}
            onSelect={setActiveId}
          />
        </div>
      </div>

      <BookingDrawer property={activeProperty} onClose={() => setActiveId(null)} />
    </section>
  )
}
