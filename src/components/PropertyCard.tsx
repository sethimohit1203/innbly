import { useEffect, useRef, useState } from 'react'
import { Link } from '~links'
import { motion } from 'framer-motion'
import { MapPin, BadgeCheck, Star, Users, Heart, Zap, Wifi, TrainFront, ShieldCheck, Scale, Sparkles, Eye } from 'lucide-react'
import type { Property } from '../types'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useCompare } from '../context/CompareContext'

const AVAILABILITY_STYLES: Record<Property['availabilityStatus'], string> = {
  Available: '',
  Limited: 'bg-amber-500 text-white',
  Booked: 'bg-slate-700 text-white',
}

const MotionLink = motion(Link)

export function PropertyCard({ property, onQuickView }: { property: Property; onQuickView?: (p: Property) => void }) {
  const { isSaved, toggleSaved } = useSavedProperties()
  const { isComparing, toggleCompare, compareIds } = useCompare()
  const [imageIndex, setImageIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const previewImages = property.images.slice(0, 3)
  const nearestMetro = property.landmarks.find((l) => l.type === 'Metro')
  const isGuestFavourite = property.rating >= 4.8 && property.reviewCount >= 100

  const startSlideshow = () => {
    if (previewImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setImageIndex((i) => (i + 1) % previewImages.length)
    }, 800)
  }

  const stopSlideshow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setImageIndex(0)
  }

  useEffect(() => () => stopSlideshow(), [])

  return (
    <MotionLink
      to={`/property/${property.id}`}
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <motion.div whileHover={{ scale: 1.08 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
          {previewImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={property.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              style={{ opacity: i === imageIndex ? 1 : 0 }}
            />
          ))}
        </motion.div>

        {previewImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1">
            {previewImages.map((_, i) => (
              <span key={i} className={`h-1 w-1 rounded-full transition-all ${i === imageIndex ? 'w-3 bg-white' : 'bg-white/60'}`} />
            ))}
          </div>
        )}

        {/* Badges on top-left vertically stacked */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {property.instantBook && (
            <span className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
              <Zap className="h-3 w-3 fill-white" /> Instant Book
            </span>
          )}
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-white border border-emerald-500 px-3 py-1 text-[10px] font-bold text-emerald-600 shadow-sm">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Audit Pass
            </span>
          )}
        </div>

        {/* Guest count badge on bottom left of image */}
        <span className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold text-slate-800 shadow-sm backdrop-blur-md">
          <Users className="h-3.5 w-3.5 text-slate-500" /> {property.maxGuests}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault()
            toggleSaved(property.id)
          }}
          aria-label={isSaved(property.id) ? 'Remove from saved properties' : 'Save property'}
          aria-pressed={isSaved(property.id)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        >
          <Heart className={`h-4 w-4 ${isSaved(property.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>

        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onQuickView(property)
            }}
            aria-label={`Quick view ${property.title}`}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </button>
        )}

        {property.availabilityStatus !== 'Available' && (
          <span className={`absolute left-14 bottom-3 rounded-full px-3 py-1 text-[10px] font-bold ${AVAILABILITY_STYLES[property.availabilityStatus]}`}>
            {property.availabilityStatus === 'Booked' ? 'Fully Booked' : 'Limited Availability'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Row 1: Title & Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-slate-900 text-base">{property.title}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {property.rating}
            <span className="font-normal text-slate-400">({property.reviewCount})</span>
          </div>
        </div>

        {/* Row 2: Location */}
        <div className="flex items-center gap-1 text-sm text-slate-400 font-medium">
          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {property.neighborhood}, {property.city}
        </div>

        {/* Row 3: Detailed amenities */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-0.5">
            <Wifi className="h-3.5 w-3.5 text-slate-400" /> {property.wifiSpeedMbps} Mbps
          </span>
          <span>·</span>
          <span>
            {(() => {
              const t = property.title.toLowerCase()
              const c = property.city.toLowerCase()
              if (t.includes('ganga') || c.includes('rishikesh')) return 'Lake View'
              if (t.includes('pool') || t.includes('monsoon') || c.includes('lonavala')) return 'Pool View'
              if (t.includes('pinewood') || c.includes('shimla') || c.includes('mussoorie')) return 'Mountain View'
              if (t.includes('haveli') || c.includes('jaipur')) return 'Garden View'
              return 'Garden View'
            })()}
          </span>
          <span>·</span>
          <span>
            {(() => {
              const pt = property.propertyType
              if (pt === 'Villas') return 'Entire Villa'
              if (pt === 'Cabins') return 'Entire Cabin'
              if (pt === 'Cottages') return 'Entire Cottage'
              if (pt === 'Apartments') return 'Entire Apartment'
              return `Entire ${pt.endsWith('s') ? pt.slice(0, -1) : pt}`
            })()}
          </span>
        </div>

        {/* Row 4: Preference & Free Cancellation */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {property.tenantPreference}
          </span>
          {property.freeCancellation && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Free Cancellation
            </span>
          )}
        </div>

        {/* Row 5: Price Footer */}
        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-4">
          <div>
            <span className="text-xl font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-slate-400"> / night</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleCompare(property.id)
              }}
              disabled={!isComparing(property.id) && compareIds.length >= 3}
              title="Add to compare"
              aria-label={isComparing(property.id) ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={isComparing(property.id)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 ${
                isComparing(property.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-xs font-bold text-primary-600 transition group-hover:bg-red-100/50">
              View Stay
            </span>
          </div>
        </div>
      </div>
    </MotionLink>
  )
}
