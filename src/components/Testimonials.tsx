import { Star, StarHalf, CircleCheck } from 'lucide-react'

const testimonials = [
  {
    initials: 'RK',
    name: 'Rishabh Kapoor',
    place: 'Stayed in Noida, Delhi NCR',
    rating: 5,
    text: '"The booking estimator was exactly accurate down to the single rupee. The co-living space is kept spotless with the daily cleanups."',
  },
  {
    initials: 'AI',
    name: 'Anjali Iyer',
    place: 'Stayed in Indiranagar, Bangalore',
    rating: 5,
    text: '"Moving into Bangalore without physical audits is scary, but innbly\'s photo walk-through and physical audit check made it stress-free."',
  },
  {
    initials: 'DM',
    name: 'Devansh Mehta',
    place: 'Stayed in Bandra, Mumbai',
    rating: 4.5,
    text: '"Super convenient scheduling. I booked a visit on Thursday and my move-in was sorted by Saturday morning. Highly recommended."',
  },
]

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 !== 0
  return (
    <div className="mb-6 flex items-center gap-1.5 text-sm text-amber-400">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400" />
      ))}
      {half && <StarHalf className="h-4 w-4 fill-amber-400" />}
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="reviews" className="border-t border-slate-100 bg-slate-50/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            Community Reviews
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Loved By Thousands
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            Verified staying experiences straight from students and young industry professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:p-8">
              <Stars rating={t.rating} />
              <p className="mb-6 font-medium italic leading-relaxed text-slate-600">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-slate-200 font-bold text-primary-600">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <CircleCheck className="h-3 w-3 text-primary-500" /> {t.place}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
