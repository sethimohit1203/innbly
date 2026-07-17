import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { properties } from '../data/properties'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { PropertyCard } from '../components/PropertyCard'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function SavedPropertiesPage() {
  usePageMeta('Saved Properties', 'The PGs, coliving spaces, and rentals you have saved on innbly.')
  const { savedIds } = useSavedProperties()
  const saved = properties.filter((p) => savedIds.includes(p.id))

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Properties</h1>
        <p className="mt-1 text-sm text-slate-500">Stays you've bookmarked for later.</p>

        {saved.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <Heart className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-600">No saved properties yet</p>
            <p className="mt-1 text-sm text-slate-400">Tap the heart icon on any property to save it here.</p>
            <Link to="/search" className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
