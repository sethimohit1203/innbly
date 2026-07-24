import { CalendarCheck, Users, MessageSquare, Mail, Home, CreditCard } from 'lucide-react'
import { useAdminData } from '../../components/AdminLayout'

const CARDS = [
  { key: 'leads' as const, label: 'Visit Requests', icon: CalendarCheck },
  { key: 'signups' as const, label: 'Signups', icon: Users },
  { key: 'contact' as const, label: 'Contact Messages', icon: MessageSquare },
  { key: 'newsletter' as const, label: 'Newsletter Subscribers', icon: Mail },
  { key: 'hostListing' as const, label: 'Host Listings', icon: Home },
]

export function AdminOverviewPage() {
  const { stats } = useAdminData()

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <c.icon className="h-6 w-6 text-primary-600" />
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats?.counts[c.key] ?? 0}</p>
            <p className="text-sm font-semibold text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Payments</h2>
            <p className="text-xs text-slate-500">Connect Razorpay to accept deposits and bookings.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RAZORPAY_KEY_ID</code> and{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RAZORPAY_KEY_SECRET</code> as environment
          variables (get free test-mode keys at{' '}
          <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">
            dashboard.razorpay.com/app/keys
          </a>
          ) to enable the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/api/payments/create-order</code> endpoint.
          Until then it safely returns "not configured" instead of charging anyone.
        </p>
      </div>
    </div>
  )
}
