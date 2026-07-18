import { Link } from 'react-router-dom'
import { properties } from '../data/properties'

function cityImage(city: string) {
  return `https://picsum.photos/seed/city-${city.toLowerCase()}/500/350`
}

export function TrendingDestinations() {
  // Only feature cities we actually have listings in — showing a fabricated
  // stay count for a city with zero inventory would be dishonest and would
  // send guests to an empty search result.
  const cities = Array.from(new Set(properties.map((p) => p.city)))
  const stats = cities.map((city) => {
    const matches = properties.filter((p) => p.city === city)
    const avgPrice = Math.round(matches.reduce((sum, p) => sum + p.price, 0) / matches.length)
    return { city, stayCount: matches.length, avgPrice }
  })

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <Link
          key={s.city}
          to={`/search?city=${encodeURIComponent(s.city)}`}
          className="group relative h-40 overflow-hidden rounded-2xl shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <img src={cityImage(s.city)} alt={s.city} className="h-full w-full object-cover transition group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-base font-extrabold">{s.city}</p>
            <p className="text-xs font-medium text-slate-200">{s.stayCount} stays</p>
            <p className="text-xs font-medium text-slate-200">Average ₹{s.avgPrice.toLocaleString('en-IN')}/night</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
