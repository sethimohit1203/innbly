import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatDisplay(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

export function DateRangePicker({ checkIn, checkOut, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const handleDayClick = (day: Date) => {
    const iso = toISO(day)
    if (!checkIn || (checkIn && checkOut)) {
      onChange(iso, null)
      return
    }
    if (iso <= checkIn) {
      onChange(iso, null)
      return
    }
    onChange(checkIn, iso)
    setOpen(false)
  }

  const goToMonth = (delta: number) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }

  const cells = buildMonthGrid(viewYear, viewMonth)

  const isInRange = (day: Date) => {
    if (!checkIn || !checkOut) return false
    const iso = toISO(day)
    return iso > checkIn && iso < checkOut
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 outline-none transition hover:border-primary-400"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="flex-1">
          {checkIn ? formatDisplay(checkIn) : 'Check-in'} — {checkOut ? formatDisplay(checkOut) : 'Check-out'}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-[60] mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-card-hover">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-slate-800">
                {new Date(viewYear, viewMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <span key={i} />
                const iso = toISO(day)
                const isPast = day < today
                const isCheckIn = iso === checkIn
                const isCheckOut = iso === checkOut
                const inRange = isInRange(day)
                return (
                  <button
                    type="button"
                    key={i}
                    disabled={isPast}
                    onClick={() => handleDayClick(day)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                      isCheckIn || isCheckOut
                        ? 'bg-primary-600 text-white'
                        : inRange
                          ? 'bg-primary-100 text-primary-700'
                          : isPast
                            ? 'cursor-not-allowed text-slate-300'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
