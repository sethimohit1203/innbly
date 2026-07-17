import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PlusCircle, Users, Home, Phone, Calendar } from 'lucide-react'
import { useLeads } from '../context/LeadsContext'
import { properties } from '../data/properties'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function HostDashboardPage() {
  usePageMeta('Host Dashboard', 'Manage your property listings and track incoming tenant leads on innbly.')
  const { leads } = useLeads()
  const [myListings] = useState(properties.slice(0, 2))
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      return () => clearTimeout(t)
    }
  }, [hash])

  return (
    <>
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Host Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your listings and track incoming tenant leads.</p>
        </div>
        <Link
          to="/dashboard/list-property"
          className="flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
        >
          <PlusCircle className="h-4.5 w-4.5" /> List Your Property
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <Home className="h-6 w-6 text-primary-600" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{myListings.length}</p>
          <p className="text-sm text-slate-500">Active listings</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <Users className="h-6 w-6 text-accent-600" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{leads.length}</p>
          <p className="text-sm text-slate-500">Incoming leads</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <Calendar className="h-6 w-6 text-amber-500" />
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {leads.filter((l) => new Date(l.visitDate.split(' · ')[0]) >= new Date(new Date().toDateString())).length}
          </p>
          <p className="text-sm text-slate-500">Upcoming visits</p>
        </div>
      </div>

      <div id="listings" className="mt-10 scroll-mt-24">
        <h2 className="mb-4 text-lg font-bold text-slate-900">My Listings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {myListings.map((p) => (
            <Link
              key={p.id}
              to={`/property/${p.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:shadow-card-hover"
            >
              <img src={p.images[0]} className="h-16 w-20 rounded-xl object-cover" alt={p.title} />
              <div>
                <p className="font-semibold text-slate-800">{p.title}</p>
                <p className="text-sm text-slate-500">
                  {p.neighborhood}, {p.city} · ₹{p.price.toLocaleString('en-IN')}/mo
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div id="leads" className="mt-10 scroll-mt-24">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Incoming Leads</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Phone Number</th>
                <th className="px-5 py-3 font-semibold">Property</th>
                <th className="px-5 py-3 font-semibold">Scheduled Visit</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No leads yet. Once tenants schedule a visit, they'll show up here.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{lead.name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {lead.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{lead.propertyTitle}</td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> {lead.visitDate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <Footer />
    </>
  )
}
