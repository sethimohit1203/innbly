import { Link } from 'react-router-dom'
import { CalendarClock, Phone } from 'lucide-react'
import { useLeads } from '../context/LeadsContext'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function MyVisitsPage() {
  usePageMeta('My Scheduled Visits', 'The property visits you have requested on innbly.')
  const { leads, myVisitIds } = useLeads()
  const myVisits = leads.filter((l) => myVisitIds.includes(l.id))

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Scheduled Visits</h1>
        <p className="mt-1 text-sm text-slate-500">Visit requests you've submitted from this browser.</p>

        {myVisits.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <CalendarClock className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-600">No visits scheduled yet</p>
            <p className="mt-1 text-sm text-slate-400">Schedule a free visit from any property page to see it here.</p>
            <Link to="/search" className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {myVisits.map((v) => (
              <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="font-bold text-slate-900">{v.propertyTitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" /> {v.visitDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> {v.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
