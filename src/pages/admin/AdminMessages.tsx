import { useState } from 'react'
import { Users, MessageSquare, Mail } from 'lucide-react'
import { useAdminData, type Stats } from '../../components/AdminLayout'

const SECTIONS: { key: 'signups' | 'contact' | 'newsletter'; label: string; icon: typeof Users; headers: string[] }[] = [
  { key: 'signups', label: 'Signups', icon: Users, headers: ['Time', 'Name', 'Email', 'Role', 'Method'] },
  { key: 'contact', label: 'Contact Messages', icon: MessageSquare, headers: ['Time', 'Name', 'Email', 'Phone', 'Message'] },
  { key: 'newsletter', label: 'Newsletter Subscribers', icon: Mail, headers: ['Time', 'Email'] },
]

export function AdminMessagesPage() {
  const { stats } = useAdminData()
  const [active, setActive] = useState<(typeof SECTIONS)[number]['key']>('signups')
  const section = SECTIONS.find((s) => s.key === active)!
  const rows = stats?.recent[active] ?? ([] as Stats['recent']['signups'])

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`rounded-2xl border p-5 text-left transition-all ${
              active === s.key ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <s.icon className="h-6 w-6 text-primary-600" />
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats?.counts[s.key] ?? 0}</p>
            <p className="text-sm font-semibold text-slate-500">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              {section.headers.map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={section.headers.length} className="px-5 py-8 text-center text-slate-400">
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
