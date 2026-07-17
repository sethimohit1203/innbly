import { useMemo, useState } from 'react'
import { X, Receipt, Loader2 } from 'lucide-react'
import type { Property } from '../../types'
import { useToast } from '../../context/ToastContext'
import { useServerPrice } from '../../hooks/useServerPrice'

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

interface BookingTotal {
  nights: number
  nightlyRate: number
  roomTotal: number
  mealsCost: number
  acCost: number
  total: number
}

export function BookingDrawer({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const { showToast } = useToast()
  const [nights, setNights] = useState(1)
  const [checkIn, setCheckIn] = useState(tomorrowISO())
  const [meals, setMeals] = useState(false)
  const [ac, setAc] = useState(false)

  const open = Boolean(property)

  const request = useMemo(
    () => (property ? { kind: 'booking', propertyId: property.id, nights, meals, ac } : null),
    [property, nights, meals, ac],
  )
  const fallback = useMemo<BookingTotal>(
    () => ({ nights, nightlyRate: 0, roomTotal: 0, mealsCost: 0, acCost: 0, total: 0 }),
    [nights],
  )
  const { data, loading, error } = useServerPrice<BookingTotal>({ request, fallback })

  const handleConfirm = () => {
    showToast(`Reservation held for ${property?.title}. Confirmation sent.`)
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:w-[35%] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {property && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">Checkout Calculator</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 scrollbar-thin">
              <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <img src={property.images[0]} className="h-20 w-20 shrink-0 rounded-xl object-cover" alt={property.title} />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-600">
                    {property.propertyType}
                  </span>
                  <h4 className="text-sm font-extrabold leading-snug text-slate-900">{property.title}</h4>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {property.neighborhood}, {property.city}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configure Booking</h5>
                <div>
                  <label htmlFor="booking-checkin-date" className="mb-2 block text-xs font-bold text-slate-700">Check-in Date</label>
                  <input
                    id="booking-checkin-date"
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="booking-nights" className="mb-2 block text-xs font-bold text-slate-700">Nights</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="booking-nights"
                      type="range"
                      min={1}
                      max={14}
                      value={nights}
                      onChange={(e) => setNights(Number(e.target.value))}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-600"
                    />
                    <span className="w-10 text-right text-sm font-extrabold text-slate-800">{nights}</span>
                  </div>
                </div>

                <fieldset className="space-y-3 pt-2">
                  <legend className="block text-xs font-bold text-slate-700">Add-on Amenities</legend>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-slate-800">3 Daily Meals Plan</p>
                      <p className="text-[10px] font-medium text-slate-400">+ ₹500/night</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={meals}
                      onChange={() => setMeals((v) => !v)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-slate-800">AC Climate Control</p>
                      <p className="text-[10px] font-medium text-slate-400">+ ₹300/night</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={ac}
                      onChange={() => setAc((v) => !v)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>
                </fieldset>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h5 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />} Live Price Receipt
                </h5>
                {error ? (
                  <p className="text-xs font-semibold text-rose-500">Could not reach the pricing service. Please retry.</p>
                ) : (
                  <>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Nightly rate × {data.nights}</span>
                      <span className="font-bold">₹{data.roomTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3 text-xs text-slate-600">
                      <span>Add-ons</span>
                      <span className="font-bold">₹{(data.mealsCost + data.acCost).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-sm font-extrabold text-slate-900">Total</span>
                      <span className="text-xl font-black text-primary-600">₹{data.total.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-6">
              <button
                onClick={handleConfirm}
                disabled={loading || Boolean(error)}
                className="w-full rounded-xl bg-stone-950 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Reservation Booking
              </button>
              <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
                Free cancellation up to 48h before check-in.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
