import { Home, Check, X, Clock } from 'lucide-react'
import { useAdminData } from '../../components/AdminLayout'

export function AdminPropertiesPage() {
  const { stats, submissions, submissionsConfigured, submissionsMessage, decidingId, decide } = useAdminData()

  return (
    <div className="space-y-6">
      {/* Property approvals — approving here makes a submission a live, publicly searchable listing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Property Approvals</h2>
            <p className="text-xs text-slate-500">Approving a submission makes it a live, publicly searchable listing.</p>
          </div>
        </div>

        {!submissionsConfigured ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {submissionsMessage ?? 'Connect Supabase (SUPABASE_SERVICE_ROLE_KEY) to review submissions here.'}
          </p>
        ) : submissions === null ? (
          <p className="text-sm text-slate-400">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate-400">No host submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {s.photo_urls?.length > 0 ? (
                    <div className="flex shrink-0 -space-x-2">
                      {s.photo_urls.slice(0, 3).map((url, i) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View photo ${i + 1} of ${s.photo_urls.length}`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm transition hover:scale-105 hover:z-10 relative"
                          />
                        </a>
                      ))}
                      {s.photo_urls.length > 3 && (
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-bold text-slate-500">
                          +{s.photo_urls.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                      <Home className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      {s.property_title}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          s.status === 'approved'
                            ? 'bg-accent-50 text-accent-700'
                            : s.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.property_type} · {s.neighborhood}, {s.city} · ₹{s.price_per_night}/night · by {s.owner_name}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => decide(s.id, 'approved')}
                    disabled={decidingId === s.id || s.status === 'approved'}
                    className="flex items-center gap-1.5 rounded-lg border border-accent-300 bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => decide(s.id, 'rejected')}
                    disabled={decidingId === s.id || s.status === 'rejected'}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  {s.status !== 'pending' && (
                    <button
                      onClick={() => decide(s.id, 'pending')}
                      disabled={decidingId === s.id}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Clock className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet backup log — the pre-Supabase mirror of the same submissions, kept as a
          secondary reference (e.g. if Supabase were ever unreachable). Not the source of truth. */}
      {stats && stats.recent.hostListing.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-1 text-sm font-extrabold text-slate-900">Submission Log (Sheets backup)</h2>
          <p className="mb-4 text-xs text-slate-500">
            Mirrors the same host submissions to Google Sheets — useful as a backup, not the source of truth.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  {['Time', 'Owner', 'Email', 'Phone', 'Title', 'City'].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent.hostListing.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    {row.slice(0, 6).map((cell, j) => (
                      <td key={j} className="max-w-xs truncate px-5 py-3 text-slate-600">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
