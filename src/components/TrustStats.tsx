// Placeholder marketing figures — replace with real numbers before launch.
const STATS = [
  { value: '10,000+', label: 'Bookings' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '300+', label: 'Verified Properties' },
  { value: '4.9★', label: 'Average Rating' },
]

export function TrustStats() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-3xl font-extrabold text-primary-700 sm:text-4xl">{s.value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
