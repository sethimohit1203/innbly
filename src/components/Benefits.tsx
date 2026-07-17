import { CircleCheck, Fingerprint, Sparkles, RotateCcw } from 'lucide-react'

const benefits = [
  {
    icon: CircleCheck,
    title: '100% Verified',
    text: 'Every listing is physical-audit checked, documented, and fully photographed by our operations team.',
  },
  {
    icon: Fingerprint,
    title: 'High-End Security',
    text: 'Premium smart locks, 24/7 CCTV surveillance in shared spaces, and active building security guards.',
  },
  {
    icon: Sparkles,
    title: 'Daily Housekeeping',
    text: 'Continuous daily cleanup of bathrooms, kitchens, common zones, and personal linens.',
  },
  {
    icon: RotateCcw,
    title: 'Direct Refunds',
    text: 'Hassle-free, guaranteed security deposit refunds processed on-the-spot during check-out.',
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
            Living Standards Redefined
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            We bridge the gap between high-end professional hospitality and authentic homestay comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
