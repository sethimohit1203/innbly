import { BadgeIndianRupee, BadgeCheck, CalendarRange, Zap, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react'

const benefits = [
  {
    icon: BadgeIndianRupee,
    title: 'No Brokerage',
    text: 'Book directly with verified hosts — zero brokerage or hidden agent fees, ever.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Rooms',
    text: 'Every listing is physical-audit checked, documented, and fully photographed by our team.',
  },
  {
    icon: CalendarRange,
    title: 'Flexible Stay',
    text: 'From a single night to long-term stays — choose the duration that fits your plans.',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    text: 'Skip the back-and-forth on eligible listings and confirm your stay immediately.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Deposit',
    text: 'Refundable security deposits are tracked transparently and returned hassle-free.',
  },
  {
    icon: GraduationCap,
    title: 'Student Friendly',
    text: 'Verified PGs and hostels near colleges, with flexible move-in dates for the academic year.',
  },
  {
    icon: Briefcase,
    title: 'Corporate Friendly',
    text: 'Furnished coliving and serviced apartments built for working professionals on relocation.',
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
            Why Choose innbly
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            We bridge the gap between high-end professional hospitality and authentic homestay comfort.
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
