import { Link } from 'react-router-dom'
import { X, Scale } from 'lucide-react'
import { properties } from '../data/properties'
import { useCompare } from '../context/CompareContext'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

const ROWS: { label: string; render: (p: (typeof properties)[number]) => React.ReactNode }[] = [
  { label: 'Price', render: (p) => `₹${p.price.toLocaleString('en-IN')}/night` },
  { label: 'Security Deposit', render: (p) => `₹${p.deposit.toLocaleString('en-IN')}` },
  { label: 'Room Size', render: (p) => `${p.roomSizeSqft} sq ft` },
  { label: 'Max Guests', render: (p) => p.maxGuests },
  { label: 'Rating', render: (p) => `${p.rating} ★ (${p.reviewCount})` },
  { label: 'Meals Included', render: (p) => (p.amenities.includes('Meals') ? 'Yes' : 'No') },
  { label: 'Nearest Metro', render: (p) => {
    const metro = p.landmarks.find((l) => l.type === 'Metro')
    return metro ? `${metro.distanceM}m` : '—'
  } },
  { label: 'Area', render: (p) => `${p.neighborhood}, ${p.city}` },
  { label: 'Verified', render: (p) => (p.verified ? 'Yes' : 'No') },
  { label: 'Free Cancellation', render: (p) => (p.freeCancellation ? 'Yes' : 'No') },
  { label: 'Amenities', render: (p) => p.amenities.join(', ') },
]

export function ComparePage() {
  usePageMeta('Compare Properties', 'Compare price, amenities, distance, and more across up to 3 properties on innbly.')
  const { compareIds, toggleCompare, clearCompare } = useCompare()
  const compareProperties = compareIds.map((id) => properties.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Compare Properties</h1>
            <p className="mt-1 text-sm text-slate-500">Side-by-side comparison of your selected stays.</p>
          </div>
          {compareProperties.length > 0 && (
            <button onClick={clearCompare} className="text-sm font-semibold text-rose-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {compareProperties.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
            <Scale className="mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-600">No properties selected for comparison</p>
            <p className="mt-1 text-sm text-slate-400">Use the compare icon on any property card to add it here (up to 3).</p>
            <Link to="/search" className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-card">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-40 border-b border-slate-200 bg-slate-50 p-4"></th>
                  {compareProperties.map((p) => (
                    <th key={p.id} className="border-b border-slate-200 bg-slate-50 p-4 align-top">
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                      <img src={p.images[0]} alt={p.title} className="mb-2 h-24 w-full rounded-lg object-cover" />
                      <Link to={`/property/${p.id}`} className="font-bold text-slate-900 hover:text-primary-600">
                        {p.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <td className="bg-slate-50/50 p-4 text-xs font-bold uppercase tracking-wide text-slate-500">{row.label}</td>
                    {compareProperties.map((p) => (
                      <td key={p.id} className="p-4 text-slate-700">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
