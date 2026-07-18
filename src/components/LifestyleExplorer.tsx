import { Link } from 'react-router-dom'

const LIFESTYLES: { label: string; emoji: string; slug: string }[] = [
  { label: 'Student Living', emoji: '👨‍🎓', slug: 'student-pg' },
  { label: 'Digital Nomad', emoji: '💻', slug: 'digital-nomad' },
  { label: 'Family', emoji: '👨‍👩‍👧', slug: 'family-stay' },
  { label: 'Corporate', emoji: '👔', slug: 'corporate' },
  { label: 'Backpacker', emoji: '🎒', slug: 'backpacker' },
  { label: 'Couple', emoji: '❤️', slug: 'couples' },
  { label: 'Senior Friendly', emoji: '👵', slug: 'senior-friendly' },
  { label: 'Pet Friendly', emoji: '🐶', slug: 'pet-friendly' },
]

export function LifestyleExplorer() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {LIFESTYLES.map((l) => (
        <Link
          key={l.slug}
          to={`/search?collection=${l.slug}`}
          className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
        >
          <span className="text-2xl">{l.emoji}</span>
          <span className="text-xs font-bold text-slate-700">{l.label}</span>
        </Link>
      ))}
    </div>
  )
}
