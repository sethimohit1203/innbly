import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Building2, Trees, Landmark, Building, Palmtree, Sprout, Gem, Waves, MoreHorizontal } from 'lucide-react'

const CATEGORIES = [
  { label: 'All Stays', icon: Home, slug: '' },
  { label: 'Villas', icon: Building2, slug: 'Villas' },
  { label: 'Cabins', icon: Trees, slug: 'Cabins' },
  { label: 'Cottages', icon: Landmark, slug: 'Cottages' },
  { label: 'Apartments', icon: Building, slug: 'Apartments' },
  { label: 'Resorts', icon: Palmtree, slug: 'Resorts' },
  { label: 'Farmhouses', icon: Sprout, slug: 'Farm Stays' },
  { label: 'Luxury Homes', icon: Gem, slug: 'Country Houses' },
  { label: 'Beach Houses', icon: Waves, slug: 'Beach' },
  { label: 'More', icon: MoreHorizontal, slug: 'more' },
]

export function CategoryScroller() {
  const navigate = useNavigate()
  const [activeSlug, setActiveSlug] = useState('')

  const handleCategoryClick = (slug: string) => {
    if (slug === 'more') {
      navigate('/search')
      return
    }
    setActiveSlug(slug)
    if (slug) {
      navigate(`/search?type=${encodeURIComponent(slug)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 pt-2 scrollbar-none items-center justify-start sm:justify-center">
      {CATEGORIES.map((c) => {
        const isActive = activeSlug === c.slug
        return (
          <button
            key={c.label}
            onClick={() => handleCategoryClick(c.slug)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4.5 py-2.5 text-xs font-bold transition-all active:scale-95 ${
              isActive
                ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
          >
            <c.icon className="h-4.5 w-4.5" />
            <span>{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}
