import { useState } from 'react'
import { Clock, TrendingUp } from 'lucide-react'

export function RoiCalculator() {
  const [rooms, setRooms] = useState(40)

  const adminHoursSaved = Math.round(rooms * 0.9)
  const revenueIncrease = Math.round(rooms * 6200 * 0.08)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-primary-600">ROI Calculator</p>
      <h3 className="mt-2 text-2xl font-extrabold text-slate-900">How many rooms do you operate?</h3>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">Room count</span>
          <span className="text-2xl font-extrabold text-primary-600">{rooms}</span>
        </div>
        <input
          type="range"
          min={5}
          max={300}
          step={5}
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-600"
        />
        <div className="mt-1 flex justify-between text-xs font-medium text-slate-400">
          <span>5 rooms</span>
          <span>300 rooms</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-primary-50 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-primary-700">{adminHoursSaved} hrs</p>
          <p className="text-sm font-semibold text-slate-500">Admin hours saved / month</p>
        </div>
        <div className="rounded-2xl bg-accent-50 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-accent-700">₹{revenueIncrease.toLocaleString('en-IN')}</p>
          <p className="text-sm font-semibold text-slate-500">Direct revenue increase / month</p>
        </div>
      </div>
    </div>
  )
}
