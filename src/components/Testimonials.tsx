import { Star, StarHalf, CircleCheck } from 'lucide-react'

const testimonials = [
  {
    initials: 'RK',
    name: 'Rishabh Kapoor',
    place: 'Stayed at a cottage in Rishikesh',
    rating: 5,
    text: '"The price breakdown was exactly accurate down to the rupee, and the cottage was kept spotless throughout our stay by the river."',
  },
  {
    initials: 'AI',
    name: 'Anjali Iyer',
    place: 'Stayed at a villa in Goa',
    rating: 5,
    text: '"Booking a villa without seeing it in person is always a little scary, but Innbly\'s verified photos and host reviews made it stress-free — the place matched exactly."',
  },
  {
    initials: 'DM',
    name: 'Devansh Mehta',
    place: 'Stayed at a cabin in Shimla',
    rating: 4.5,
    text: '"Super convenient booking. I confirmed a weekend cabin trip on Thursday and we were checked in by Saturday morning. Highly recommended."',
  },
  {
    initials: 'AS',
    name: 'Aanya Sharma',
    place: 'Stayed at a farmhouse in Jaipur',
    rating: 5,
    text: '"Super clean, authentic farmhouse experience. The hosts were incredibly welcoming, served home-cooked meals, and the pool was pristine."',
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
    <section id="reviews" className="border-t border-slate-100 bg-slate-50/50 py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-20">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full bg-primary-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            Community Reviews
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Loved By Thousands of Travelers
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            Verified stay experiences straight from real guests across India.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-3xl border border-slate-100/60 bg-white p-6 shadow-card hover:shadow-xl transition-all duration-300 md:p-8 hover:-translate-y-1">
              <Stars rating={t.rating} />
              <p className="mb-6 font-semibold italic leading-relaxed text-slate-650 text-sm">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-rose-50 font-bold text-primary-600">
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
