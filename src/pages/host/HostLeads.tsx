import { Phone, Calendar } from 'lucide-react'
import { useLeads } from '../../context/LeadsContext'
import { usePageMeta } from '../../hooks/usePageMeta'

export function HostLeadsPage() {
  usePageMeta('Leads Tracker', 'Track incoming tenant leads and visit requests on innbly.')
  const { leads } = useLeads()

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">Leads Tracker</h2>
      <p className="mb-6 text-sm text-slate-500">{leads.length} lead{leads.length === 1 ? '' : 's'} total.</p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Phone Number</th>
              <th className="px-5 py-3 font-semibold">Property</th>
              <th className="px-5 py-3 font-semibold">Scheduled Visit</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No leads yet. Once tenants schedule a visit, they'll show up here.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{lead.name}</td>
                <td className="px-5 py-3 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{lead.propertyTitle}</td>
                <td className="px-5 py-3 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {lead.visitDate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
