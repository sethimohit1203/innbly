const STATS = [
  { value: '10,000+', label: 'Unique Properties' },
  { value: '95%', label: 'Happy Travelers' },
  { value: '300+', label: 'Destinations' },
  { value: '4.9★', label: 'Average Rating' },
]

export function TrustStats() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-50/60 via-red-50/40 to-amber-50/30 border border-rose-100/50 dark:from-stone-900/60 dark:via-stone-900/40 dark:to-stone-900/30 dark:border-stone-800/50 py-20 my-16">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-20 grid grid-cols-2 gap-8 md:grid-cols-4 items-center">
        {STATS.map((s) => (
          <div key={s.label} className="text-center group">
            <p className="text-4xl sm:text-5xl md:text-6xl font-black text-primary-600 tracking-tight transition-transform duration-300 group-hover:scale-105">
              {s.value}
            </p>
            <p className="mt-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
