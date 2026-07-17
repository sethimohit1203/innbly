import { MapPin } from 'lucide-react'
import type { Property } from '../../types'

const PIN_POSITIONS: Record<string, { top: string; left: string }> = {
  p1: { top: '28%', left: '55%' },
  p2: { top: '62%', left: '20%' },
  p3: { top: '18%', left: '75%' },
  p4: { top: '75%', left: '65%' },
  p5: { top: '45%', left: '35%' },
  p6: { top: '35%', left: '82%' },
  p7: { top: '55%', left: '48%' },
}

export function PriceMap({
  listings,
  hoveredId,
  activeId,
  onHover,
  onSelect,
}: {
  listings: Property[]
  hoveredId: string | null
  activeId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-accent-50 via-slate-100 to-primary-50">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
        Live pricing map
      </div>

      {listings.map((p) => {
        const pos = PIN_POSITIONS[p.id] ?? { top: '50%', left: '50%' }
        const isActive = hoveredId === p.id || activeId === p.id
        return (
          <button
            key={p.id}
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(p.id)}
            style={{ top: pos.top, left: pos.left }}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-xs font-extrabold shadow-md transition-all ${
              isActive
                ? 'z-30 scale-110 border-stone-950 bg-stone-950 text-white'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
            }`}
          >
            ₹{Math.round(p.price / 1000)}k
          </button>
        )
      })}

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-md">
        <MapPin className="h-3.5 w-3.5 text-primary-500" /> {listings.length} pins shown
      </div>
    </div>
  )
}
