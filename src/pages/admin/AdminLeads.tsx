import { useAdminData } from '../../components/AdminLayout'

const HEADERS = ['Time', 'Name', 'Phone', 'Property', 'Visit Date', 'Slot']

export function AdminLeadsPage() {
  const { stats } = useAdminData()
  const rows = stats?.recent.leads ?? []

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-slate-900">Leads Tracker</h2>
      <p className="mb-6 text-sm text-slate-500">{stats?.counts.leads ?? 0} visit request(s) total.</p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              {HEADERS.map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={HEADERS.length} className="px-5 py-8 text-center text-slate-400">
                  No entries yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                {row.map((cell, j) => (
                  <td key={j} className="max-w-xs truncate px-5 py-3 text-slate-600">{String(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
