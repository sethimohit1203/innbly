import { Link } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import { ModuleShowcase } from '../../components/enterprise/ModuleShowcase'
import { RoiCalculator } from '../../components/enterprise/RoiCalculator'
import { DemoCalendar } from '../../components/enterprise/DemoCalendar'
import { Footer } from '../../components/Footer'
import { usePageMeta } from '../../hooks/usePageMeta'

export function EnterpriseHomePage() {
  usePageMeta(
    'innbly for Hotels — Property Management, Booking Engine & POS',
    'innbly Enterprise is a unified hotel operations platform: property management, a commission-free booking engine, F&B POS, and real-time analytics.',
  )

  return (
    <>
      <section className="hero-gradient relative overflow-hidden border-b border-slate-100 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-stone-950 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <Building2 className="h-3.5 w-3.5" /> innbly for Hotels
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              One platform to run your entire property.
            </h1>
            <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-slate-600">
              Property management, direct booking engine, F&B POS, and analytics — unified so your front desk,
              kitchen, and revenue team finally see the same numbers.
            </p>
          </div>

          <div className="mt-16">
            <ModuleShowcase />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <RoiCalculator />
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
              See it live
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Get a walkthrough from our team
            </h2>
            <p className="mt-4 max-w-md font-medium text-slate-500">
              Pick a slot below and we'll show you the Gantt-style front desk board, the booking engine, and how
              F&B posts straight to a guest folio — live, in 20 minutes.
            </p>
            <Link
              to="/enterprise/dashboard"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:underline"
            >
              Preview the operations dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <DemoCalendar />
        </div>
      </section>

      <Footer />
    </>
  )
}
