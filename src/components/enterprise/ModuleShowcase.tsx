import { useState } from 'react'
import { BedDouble, CalendarCheck, UtensilsCrossed, BarChart3, CheckCircle2, TrendingUp } from 'lucide-react'
import { MODULES, type ModuleKey } from '../../data/enterpriseData'

const TAB_ICONS: Record<ModuleKey, React.ComponentType<{ className?: string }>> = {
  pms: BedDouble,
  booking: CalendarCheck,
  fnb: UtensilsCrossed,
  analytics: BarChart3,
}

function PmsMock() {
  const rows = [
    { room: '101', guest: 'A. Kapoor', status: 'Checked-in', color: 'bg-accent-500' },
    { room: '102', guest: 'M. Iyer', status: 'Housekeeping', color: 'bg-amber-500' },
    { room: '103', guest: '—', status: 'Vacant clean', color: 'bg-slate-300' },
    { room: '104', guest: 'S. Fernandes', status: 'Checkout today', color: 'bg-primary-500' },
  ]
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.room} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
            <span className="text-sm font-bold text-slate-800">Room {r.room}</span>
            <span className="text-sm text-slate-400">{r.guest}</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">{r.status}</span>
        </div>
      ))}
    </div>
  )
}

function BookingMock() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-800">Deluxe King Room</span>
          <span className="font-bold text-primary-600">₹6,200/night</span>
        </div>
        <div className="mt-2 flex gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu'].map((d) => (
            <span key={d} className="flex-1 rounded-lg bg-accent-50 py-1.5 text-center text-xs font-semibold text-accent-700">
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white">
        <CheckCircle2 className="h-4 w-4" /> 0% commission direct booking confirmed
      </div>
    </div>
  )
}

function FnbMock() {
  const items = [
    { name: 'Club Sandwich', qty: 1, price: 320 },
    { name: 'Masala Chai x2', qty: 2, price: 160 },
    { name: 'Room Service Fee', qty: 1, price: 50 },
  ]
  const total = items.reduce((s, i) => s + i.price, 0)
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Order → Room 101</p>
      <div className="space-y-2 text-sm">
        {items.map((i) => (
          <div key={i.name} className="flex justify-between text-slate-600">
            <span>{i.name}</span>
            <span className="font-semibold">₹{i.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
        <span>Posted to folio</span>
        <span>₹{total}</span>
      </div>
    </div>
  )
}

function AnalyticsMock() {
  const bars = [40, 55, 48, 62, 70, 65, 80]
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">RevPAR trend</p>
        <span className="flex items-center gap-1 text-xs font-bold text-accent-600">
          <TrendingUp className="h-3.5 w-3.5" /> +18%
        </span>
      </div>
      <div className="flex h-28 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

const PANELS: Record<ModuleKey, React.ComponentType> = {
  pms: PmsMock,
  booking: BookingMock,
  fnb: FnbMock,
  analytics: AnalyticsMock,
}

export function ModuleShowcase() {
  const [active, setActive] = useState<ModuleKey>('pms')
  const activeModule = MODULES.find((m) => m.key === active)!
  const Panel = PANELS[active]

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => {
            const Icon = TAB_ICONS[m.key]
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  active === m.key
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" /> {m.label}
              </button>
            )
          })}
        </div>
        <p key={activeModule.key} className="mt-6 max-w-md text-slate-500 animate-fade-in">
          {activeModule.blurb}
        </p>
      </div>

      <div key={active} className="animate-fade-in rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-card-hover">
        <Panel />
      </div>
    </div>
  )
}
