import { BookOpen, ShieldCheck, IndianRupee, Camera, MessageCircle } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'

const GUIDES = [
  {
    icon: Camera,
    title: 'Take photos that get bookings',
    body: 'Shoot in daylight, wide-angle where possible, and lead with your best room. Listings with 8+ photos convert noticeably better than ones with 3-4.',
  },
  {
    icon: IndianRupee,
    title: 'Price competitively',
    body: 'Check the Pricing & Calendar tab to see how your nightly rate compares across weekdays vs weekends, and consider enabling the smart-pricing starter default if you\'re unsure where to start.',
  },
  {
    icon: ShieldCheck,
    title: 'Get the Verified badge',
    body: 'Complete your listing\'s documents step fully — verified, audited listings get the "Audit Pass" badge shown to guests, which builds trust before they book.',
  },
  {
    icon: MessageCircle,
    title: 'Respond quickly to leads',
    body: 'Check your Leads Tracker and Appointments regularly — guests scheduling a visit expect a callback within a day.',
  },
]

/** Real, if simple, host-facing content page — not a stub. There's no CMS
 * behind this, so the guides are written directly into the page rather than
 * fetched, same as the rest of this app's static copy (FAQ, Terms, etc). */
export function HostResourcesPage() {
  usePageMeta('Hosting Resources', 'Guides and tips for hosting on innbly.')

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hosting Resources</h2>
          <p className="text-sm text-slate-500">Guides to help you host well and get booked more.</p>
        </div>
      </div>

      <div className="space-y-4">
        {GUIDES.map((g) => (
          <div key={g.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="mb-1.5 flex items-center gap-2 font-semibold text-slate-800">
              <g.icon className="h-4 w-4 text-primary-600" /> {g.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{g.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
