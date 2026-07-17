import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM']

function getDays(offset: number) {
  const days: Date[] = []
  const start = new Date()
  start.setDate(start.getDate() + offset)
  for (let i = 0; i < 5; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export function DemoCalendar() {
  const { showToast } = useToast()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const days = getDays(weekOffset * 5)

  const handleConfirm = () => {
    if (!selectedSlot) return
    setConfirmed(true)
    showToast('Demo booked! Our team will call you at the scheduled time.')
  }

  if (confirmed) {
    const day = days[selectedDay]
    return (
      <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Demo scheduled!</h3>
        <p className="mt-2 text-sm text-slate-500">
          {day.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-slate-900">Book a Demo</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedDay(i)
              setSelectedSlot(null)
            }}
            className={`flex flex-col items-center gap-0.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
              selectedDay === i
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            <span className="text-sm">{d.getDate()}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
              selectedSlot === slot
                ? 'border-accent-600 bg-accent-50 text-accent-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedSlot}
        className="mt-6 w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/10 transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Confirm Demo Slot
      </button>
    </div>
  )
}
