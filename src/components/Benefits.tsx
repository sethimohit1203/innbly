import { BadgeIndianRupee, BadgeCheck, CalendarRange, Zap, ShieldCheck, Users, Sparkles } from 'lucide-react'

const benefits = [
  {
    icon: BadgeIndianRupee,
    title: 'Transparent Pricing',
    text: 'Book directly with verified hosts — the price you see is the price you pay, with zero brokerage or hidden fees.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Properties',
    text: 'Every villa, cottage, and farmhouse is physically audited, documented, and fully photographed by our team before it goes live.',
  },
  {
    icon: CalendarRange,
    title: 'Flexible Stays',
    text: 'From a weekend getaway to an extended holiday — choose check-in and check-out dates that fit your trip.',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    text: 'Skip the back-and-forth on eligible listings and confirm your stay immediately.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Booking',
    text: 'Refundable security deposits and payments are tracked transparently, with clear cancellation policies on every listing.',
  },
  {
    icon: Users,
    title: 'Trusted Hosts',
    text: 'Real hosts with verified response rates and guest reviews — chat directly before and during your stay.',
  },
  {
    icon: Sparkles,
    title: 'Curated Experiences',
    text: 'Handpicked villas, cabins, and farmhouses in India\'s most-loved getaway destinations — not a generic listings dump.',
  },
]

export function Benefits() {
  return (
    <section id="benefits" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            Our Standards
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Why Choose Innbly
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            We bridge the gap between high-end professional hospitality and authentic vacation-home comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-xl text-primary-600 transition-transform group-hover:scale-110">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{b.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-500">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
