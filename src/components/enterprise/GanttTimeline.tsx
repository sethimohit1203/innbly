import { useEffect, useRef, useState } from 'react'
import { ROOMS, TIMELINE_DAYS, RESERVATIONS, type Reservation } from '../../data/enterpriseData'
import { useToast } from '../../context/ToastContext'

const COL_WIDTH = 72
const ROOM_COL_WIDTH = 96

const STATUS_STYLES: Record<Reservation['status'], string> = {
  'checked-in': 'bg-accent-500',
  confirmed: 'bg-primary-500',
  'checkout-today': 'bg-amber-500',
}

function dayLabel(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return { weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }), date: d.getDate() }
}

export function GanttTimeline() {
  const { showToast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS)
  const dragState = useRef<{ id: string; startX: number; originalDay: number; nights: number } | null>(null)
  const [dragPreview, setDragPreview] = useState<{ id: string; startDay: number } | null>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const drag = dragState.current
      if (!drag) return
      const deltaCols = Math.round((e.clientX - drag.startX) / COL_WIDTH)
      const maxStart = TIMELINE_DAYS - drag.nights
      const newStart = Math.min(maxStart, Math.max(0, drag.originalDay + deltaCols))
      setDragPreview({ id: drag.id, startDay: newStart })
    }
    const handleUp = () => {
      const drag = dragState.current
      if (!drag) return
      setReservations((prev) =>
        prev.map((r) => (r.id === drag.id && dragPreview ? { ...r, startDay: dragPreview.startDay } : r)),
      )
      if (dragPreview && dragPreview.startDay !== drag.originalDay) {
        showToast('Reservation moved — front desk notified.')
      }
      dragState.current = null
      setDragPreview(null)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragPreview])

  const startDrag = (e: React.PointerEvent, res: Reservation) => {
    dragState.current = { id: res.id, startX: e.clientX, originalDay: res.startDay, nights: res.nights }
    setDragPreview({ id: res.id, startDay: res.startDay })
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white scrollbar-thin">
      <div style={{ width: ROOM_COL_WIDTH + COL_WIDTH * TIMELINE_DAYS, minWidth: '100%' }}>
        {/* Header row */}
        <div className="flex border-b border-slate-100">
          <div style={{ width: ROOM_COL_WIDTH }} className="shrink-0 border-r border-slate-100 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Room
          </div>
          {Array.from({ length: TIMELINE_DAYS }).map((_, i) => {
            const { weekday, date } = dayLabel(i)
            const isToday = i === 0
            return (
              <div
                key={i}
                style={{ width: COL_WIDTH }}
                className={`shrink-0 border-r border-slate-50 py-2 text-center text-[11px] font-bold ${isToday ? 'bg-primary-50 text-primary-700' : 'text-slate-400'}`}
              >
                <div>{weekday}</div>
                <div className="text-sm">{date}</div>
              </div>
            )
          })}
        </div>

        {/* Room rows */}
        {ROOMS.map((room) => (
          <div key={room.id} className="relative flex border-b border-slate-50 last:border-0">
            <div style={{ width: ROOM_COL_WIDTH }} className="shrink-0 border-r border-slate-100 px-3 py-4 text-sm font-bold text-slate-700">
              {room.label}
            </div>
            <div className="relative flex-1" style={{ height: 56 }}>
              {/* grid lines */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: TIMELINE_DAYS }).map((_, i) => (
                  <div key={i} style={{ width: COL_WIDTH }} className="shrink-0 border-r border-slate-50" />
                ))}
              </div>
              {reservations
                .filter((r) => r.roomId === room.id)
                .map((r) => {
                  const isDragging = dragPreview?.id === r.id
                  const startDay = isDragging ? dragPreview!.startDay : r.startDay
                  return (
                    <button
                      key={r.id}
                      onPointerDown={(e) => startDrag(e, r)}
                      title={`${r.guestName} · ${r.nights} nights`}
                      style={{
                        left: startDay * COL_WIDTH + 4,
                        width: r.nights * COL_WIDTH - 8,
                        top: 10,
                        height: 36,
                      }}
                      className={`absolute flex cursor-grab items-center rounded-lg px-2.5 text-left text-xs font-bold text-white shadow-sm transition-shadow active:cursor-grabbing active:shadow-lg ${STATUS_STYLES[r.status]} ${isDragging ? 'opacity-90 ring-2 ring-white' : ''}`}
                    >
                      <span className="truncate">{r.guestName}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
