import { DoorOpen, Gauge, Sparkles, Clock } from 'lucide-react'
import { MetricCard } from '../../components/enterprise/MetricCard'
import { GanttTimeline } from '../../components/enterprise/GanttTimeline'
import { GradientLineChart } from '../../components/enterprise/GradientLineChart'
import { UPCOMING_ARRIVALS, OCCUPANCY_TREND } from '../../data/enterpriseData'
import { usePageMeta } from '../../hooks/usePageMeta'

export function EnterpriseDashboardPage() {
  usePageMeta('Operations Dashboard — innbly for Hotels', 'Executive overview of check-ins, occupancy, and housekeeping across your property.')

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Operations Dashboard</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">Real-time view across front desk, housekeeping, and revenue.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard icon={DoorOpen} label="Tonight's Check-ins" value="14" tone="primary" sub="4 arriving after 6 PM" />
        <MetricCard icon={Gauge} label="Occupancy" value="88%" tone="accent" sub="Up 6% vs last week" />
        <MetricCard icon={Sparkles} label="Housekeeping Alerts" value="3" tone="amber" sub="Rooms pending turnover" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Room Timeline</h2>
          <p className="text-xs font-semibold text-slate-400">Drag a reservation bar to reschedule</p>
        </div>
        <GanttTimeline />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
          <GradientLineChart data={OCCUPANCY_TREND} label="Occupancy % — last 12 days" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Upcoming Guest Arrivals</h3>
          <div className="space-y-3">
            {UPCOMING_ARRIVALS.map((a) => (
              <div key={a.name} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-slate-800">{a.name}</p>
                  <p className="text-xs font-medium text-slate-400">Room {a.room} · {a.nights} nights · {a.source}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
