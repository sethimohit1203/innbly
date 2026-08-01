import { CalendarClock, Phone, Home } from 'lucide-react'
import { useLeads } from '../../context/LeadsContext'
import { usePageMeta } from '../../hooks/usePageMeta'

/** Every "appointment" here is a real scheduled property visit from a lead
 * (see Leads Tracker) — same underlying data, just presented as upcoming
 * visits rather than a raw table, sorted soonest-first. No separate
 * appointments backend exists, so this reuses LeadsContext rather than
 * inventing a second, disconnected data source. */
export function HostAppointmentsPage() {
  usePageMeta('Appointments', 'Upcoming property visits scheduled by tenants.')
  const { leads } = useLeads()

  const upcoming = [...leads].sort((a, b) => a.visitDate.localeCompare(b.visitDate))

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Appointments</h2>
      <p className="mb-6 text-sm text-slate-500">Property visits tenants have scheduled with you.</p>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <CalendarClock className="h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-600">No appointments yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            When a tenant schedules a visit to one of your properties, it'll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div>
                <p className="font-semibold text-slate-800">{lead.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Home className="h-3.5 w-3.5 text-slate-400" /> {lead.propertyTitle}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-bold text-primary-700">
                <CalendarClock className="h-3.5 w-3.5" /> {lead.visitDate}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
