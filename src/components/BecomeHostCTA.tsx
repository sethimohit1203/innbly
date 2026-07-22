import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, IndianRupee, ShieldCheck, Clock } from 'lucide-react'

const POINTS = [
  { icon: IndianRupee, text: 'Set your own nightly price and keep control of your calendar' },
  { icon: ShieldCheck, text: 'Reach guests directly — no brokerage cut on your bookings' },
  { icon: Clock, text: 'List in minutes; go live once your submission is reviewed' },
]

export function BecomeHostCTA() {
  return (
    <section className="relative overflow-hidden bg-stone-950 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-400">
            For Property Owners
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Turn your space into your next income stream.
          </h2>
          <p className="mt-4 max-w-md font-medium leading-relaxed text-slate-400">
            Villas, farmhouses, PGs, coliving rooms — if it's stay-ready, it belongs on innbly. List your property and
            start receiving guest inquiries directly.
          </p>
          <Link
            to="/dashboard/list-property"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-accent-500 px-7 py-4 font-bold text-stone-950 shadow-lg transition-all hover:bg-accent-400 active:scale-[0.98]"
          >
            List Your Property <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center gap-5"
        >
          {POINTS.map((p) => (
            <div key={p.text} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="pt-1.5 font-medium text-slate-200">{p.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
