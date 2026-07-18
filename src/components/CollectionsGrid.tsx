import { Link } from 'react-router-dom'

const COLLECTIONS: { label: string; slug: string; image: string }[] = [
  { label: 'Top Rated', slug: 'top-rated', image: 'https://picsum.photos/seed/coll-top/400/300' },
  { label: 'Most Loved', slug: 'most-loved', image: 'https://picsum.photos/seed/coll-loved/400/300' },
  { label: 'Budget Picks', slug: 'budget-picks', image: 'https://picsum.photos/seed/coll-budget/400/300' },
  { label: 'Luxury', slug: 'luxury', image: 'https://picsum.photos/seed/coll-luxury/400/300' },
  { label: 'Weekend Escape', slug: 'weekend', image: 'https://picsum.photos/seed/coll-weekend/400/300' },
  { label: 'Women Only', slug: 'women-only', image: 'https://picsum.photos/seed/coll-women/400/300' },
  { label: 'Corporate', slug: 'corporate', image: 'https://picsum.photos/seed/coll-corp/400/300' },
  { label: 'Students', slug: 'students', image: 'https://picsum.photos/seed/coll-students/400/300' },
  { label: 'Near Metro', slug: 'near-metro', image: 'https://picsum.photos/seed/coll-metro/400/300' },
  { label: 'New Listings', slug: 'new-listings', image: 'https://picsum.photos/seed/coll-new/400/300' },
]

export function CollectionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {COLLECTIONS.map((c) => (
        <Link
          key={c.slug}
          to={`/search?collection=${c.slug}`}
          className="group relative h-32 overflow-hidden rounded-2xl shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <img src={c.image} alt={c.label} className="h-full w-full object-cover transition group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
          <span className="absolute bottom-3 left-3 text-sm font-extrabold text-white">{c.label}</span>
        </Link>
      ))}
    </div>
  )
}
