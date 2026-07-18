import { Link } from 'react-router-dom'
import { TrainFront, Gem, Briefcase, Mountain, Waves, Laptop, Heart, PartyPopper, Dog, Wallet } from 'lucide-react'

const CATEGORIES = [
  { label: 'Near Metro', icon: TrainFront, slug: 'near-metro' },
  { label: 'Luxury', icon: Gem, slug: 'luxury' },
  { label: 'Executive', icon: Briefcase, slug: 'executive' },
  { label: 'Mountain', icon: Mountain, slug: 'mountain-nature' },
  { label: 'Beach', icon: Waves, slug: 'beach' },
  { label: 'Work Friendly', icon: Laptop, slug: 'work-friendly' },
  { label: 'Couples', icon: Heart, slug: 'couples' },
  { label: 'Weekend', icon: PartyPopper, slug: 'weekend' },
  { label: 'Pet Friendly', icon: Dog, slug: 'pet-friendly' },
  { label: 'Under ₹2000', icon: Wallet, slug: 'under-2000' },
]

export function CategoryScroller() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          to={`/search?collection=${c.slug}`}
          className="flex shrink-0 flex-col items-center gap-2 text-slate-500 transition-colors hover:text-primary-600"
        >
          <c.icon className="h-6 w-6" />
          <span className="whitespace-nowrap text-xs font-semibold">{c.label}</span>
        </Link>
      ))}
    </div>
  )
}
