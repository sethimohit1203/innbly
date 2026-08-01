import { BadgeIndianRupee, BadgeCheck, Zap, ShieldCheck, Users, Sparkles } from 'lucide-react'

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
    <section id="benefits" className="bg-slate-50/30 py-24 border-t border-slate-100">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-20">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-red-50 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-600 border border-rose-100/50">
            Our Standards
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Why Choose Innbly
          </h2>
          <p className="mt-4 text-sm font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
            We bridge the gap between high-end professional hospitality and authentic vacation-home comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-3xl border border-slate-100/60 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100/50"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-primary-600 border border-rose-100/50 transition-transform duration-300 group-hover:scale-110">
                <b.icon className="h-6 w-6 stroke-[2px]" />
              </div>
              <h3 className="mb-2.5 text-lg font-extrabold text-slate-900">{b.title}</h3>
              <p className="text-sm font-semibold leading-relaxed text-slate-500">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
