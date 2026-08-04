import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FAQItem {
  q: string
  a: string
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    q: 'What kind of properties does Innbly list?',
    a: 'Innbly lists verified villas, holiday homes, cabins, cottages, farmhouses, and apartments for short getaways and vacations across India.',
  },
  {
    q: 'Is booking on Innbly really instant?',
    a: 'Listings marked "Instant Book" confirm immediately once you submit a request. Others require the host to accept your request first, usually within a few hours.',
  },
  {
    q: 'How does the security deposit work?',
    a: 'Each listing shows its refundable security deposit upfront in the price breakdown. Deposits are collected and refunded directly by the host — Innbly does not hold funds in escrow today.',
  },
  {
    q: 'What does "Verified" mean on a listing?',
    a: 'Verified listings have passed our internal photo and detail audit for accuracy. It is not a guarantee of quality — always review host ratings and recent reviews too.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Listings tagged "Free Cancellation" allow you to cancel without penalty up to the window stated on the property page. Other listings follow the host\'s own cancellation policy shown at checkout.',
  },
  {
    q: 'How do I pay for a stay on Innbly?',
    a: 'Reserve & Pay opens a secure Razorpay checkout showing the full price breakdown — room rate, service fee, taxes, and deposit — before you confirm.',
  },
  {
    q: 'Can I contact the host before booking?',
    a: 'Yes — every listing shows the host\'s response rate and typical response time, and you can message them with questions before you commit to a stay.',
  },
  {
    q: 'Are prices per night or per month?',
    a: 'All prices on Innbly are nightly rates, shown upfront with no hidden charges — ideal for weekend trips and short vacations, not long-term renting.',
  },
  {
    q: 'How do I become a host on Innbly?',
    a: 'Tap "List Your Property" in the navigation, tell us about your villa, cabin, or holiday home, and submit it for review. Once approved, your listing goes live and guest inquiries reach you directly.',
  },
  {
    q: 'Which destinations does Innbly cover?',
    a: 'Innbly features stays across India\'s most popular getaway destinations, including Goa, Manali, Shimla, Jaipur, Udaipur, Mussoorie, Coorg, Ooty, and Rishikesh, with more destinations added regularly.',
  },
]

export function FAQAccordion({ items = DEFAULT_FAQS }: { items?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-bold text-slate-900">{item.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
