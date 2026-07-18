import { useNavigate } from 'react-router-dom'

const CHIPS: { label: string; emoji: string; slug: string }[] = [
  { label: 'Near Metro', emoji: '🔥', slug: 'near-metro' },
  { label: 'Work Friendly', emoji: '💻', slug: 'work-friendly' },
  { label: 'Entire Home', emoji: '🏡', slug: 'entire-home' },
  { label: 'Family Stay', emoji: '👨‍👩‍👧', slug: 'family-stay' },
  { label: 'Under ₹2000', emoji: '💰', slug: 'under-2000' },
  { label: 'Pet Friendly', emoji: '🐶', slug: 'pet-friendly' },
  { label: 'High Speed WiFi', emoji: '📶', slug: 'high-speed-wifi' },
  { label: 'Pool', emoji: '🏊', slug: 'pool' },
  { label: 'Parking', emoji: '🅿️', slug: 'parking' },
]

export function HeroQuickChips() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip.slug}
          onClick={() => navigate(`/search?collection=${chip.slug}`)}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-white hover:shadow-md"
        >
          <span>{chip.emoji}</span> {chip.label}
        </button>
      ))}
    </div>
  )
}
