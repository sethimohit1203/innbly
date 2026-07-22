import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, MapPin, Star, Users, BadgeCheck, Zap, ShieldCheck, ArrowRight } from 'lucide-react'
import type { Property } from '../types'

export function QuickViewModal({ property, onClose }: { property: Property | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {property && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="relative h-56 sm:h-full">
                <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {property.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-accent-400 backdrop-blur-md">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {property.instantBook && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-600/90 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      <Zap className="h-3 w-3" /> Instant Book
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 p-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{property.title}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {property.neighborhood}, {property.city}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {property.rating} <span className="font-normal text-slate-400">({property.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" /> Up to {property.maxGuests} guests
                  </span>
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{property.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {property.amenities.slice(0, 4).map((a) => (
                    <span key={a} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {a}
                    </span>
                  ))}
                  {property.freeCancellation && (
                    <span className="flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
                      <ShieldCheck className="h-3 w-3" /> Free Cancellation
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
                    <span className="block text-xs font-semibold text-slate-400">/ night</span>
                  </div>
                  <Link
                    to={`/property/${property.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
                  >
                    View Full Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
