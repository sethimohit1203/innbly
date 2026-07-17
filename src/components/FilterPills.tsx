import { useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

interface FilterPillProps {
  label: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}

function FilterPill({ label, options, selected, onToggle }: FilterPillProps) {
  const [open, setOpen] = useState(false)
  const active = selected.length > 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
          active
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        {label}
        {active && <span className="rounded-full bg-primary-600 px-1.5 text-xs text-white">{selected.length}</span>}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-card-hover animate-fade-in">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export interface Filters {
  priceRanges: string[]
  roomTypes: string[]
  tenantPrefs: string[]
  amenities: string[]
}

export function FilterPills({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const toggle = (key: keyof Filters, value: string) => {
    const current = filters[key]
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    setFilters({ ...filters, [key]: next })
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
        <SlidersHorizontal className="h-4 w-4" /> Filters:
      </span>
      <FilterPill
        label="Price Range"
        options={['Under ₹8,000', '₹8,000–₹12,000', '₹12,000–₹16,000', 'Above ₹16,000']}
        selected={filters.priceRanges}
        onToggle={(v) => toggle('priceRanges', v)}
      />
      <FilterPill
        label="Room Type"
        options={['Single', 'Sharing']}
        selected={filters.roomTypes}
        onToggle={(v) => toggle('roomTypes', v)}
      />
      <FilterPill
        label="Tenant Preference"
        options={['Boys', 'Girls', 'Family', 'Anyone']}
        selected={filters.tenantPrefs}
        onToggle={(v) => toggle('tenantPrefs', v)}
      />
      <FilterPill
        label="Amenities"
        options={['Wi-Fi', 'AC', 'Meals', 'Housekeeping', 'Parking', 'Gym', 'Power Backup']}
        selected={filters.amenities}
        onToggle={(v) => toggle('amenities', v)}
      />
    </div>
  )
}
