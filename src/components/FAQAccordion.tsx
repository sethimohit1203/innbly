import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FAQItem {
  q: string
  a: string
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    q: 'Is booking on innbly really instant?',
    a: 'Listings marked "Instant Book" confirm immediately once you submit a request. Others require the host to accept your request first, usually within a few hours.',
  },
  {
    q: 'How does the security deposit work?',
    a: 'Each listing shows its refundable security deposit upfront in the price breakdown. Deposits are collected and refunded directly by the host — innbly does not hold funds in escrow today.',
  },
  {
    q: 'What does "Verified" mean on a listing?',
    a: 'Verified listings have passed our internal photo and detail audit for accuracy. It is not a guarantee of quality — always review host ratings and recent reviews too.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Listings tagged "Free Cancellation" allow you to cancel without penalty up to the window stated on the property page. Other listings follow the host\'s own cancellation policy shown on checkout.',
  },
  {
    q: 'How do I become a host?',
    a: 'Tap "List Your Property" in the navigation, tell us about your space, and submit it for review. Once approved, your listing goes live and guest inquiries reach you directly.',
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
