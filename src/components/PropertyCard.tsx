import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

        <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-slate-900 shadow-sm backdrop-blur-md">
          <Users className="h-3 w-3" /> {property.maxGuests}
        </span>

        <button
          onClick={(e) => {
            e.preventDefault()
            toggleSaved(property.id)
          }}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition hover:scale-110"
        >
          <Heart className={`h-4 w-4 ${isSaved(property.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>

        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onQuickView(property)
            }}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </button>
        )}

        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5">
          {isGuestFavourite && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/95 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> Guest Favourite
            </span>
          )}
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-accent-400 backdrop-blur-md">
              <BadgeCheck className="h-3 w-3" /> Audit Pass
            </span>
          )}
          {property.instantBook && (
            <span className="flex items-center gap-1 rounded-full bg-primary-600/90 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              <Zap className="h-3 w-3" /> Instant Book
            </span>
          )}
        </div>

        {property.availabilityStatus !== 'Available' && (
          <span className={`absolute left-4 bottom-3 rounded-full px-3 py-1 text-[10px] font-bold ${AVAILABILITY_STYLES[property.availabilityStatus]}`}>
            {property.availabilityStatus === 'Booked' ? 'Fully Booked' : 'Limited Availability'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-slate-900">{property.title}</h3>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {property.rating}
            <span className="font-normal text-slate-400">({property.reviewCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {property.neighborhood}, {property.city}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
          {nearestMetro && (
            <span className="flex items-center gap-1">
              <TrainFront className="h-3.5 w-3.5 text-slate-400" /> {nearestMetro.distanceM}m from Metro
            </span>
          )}
          <span className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-slate-400" /> {property.wifiSpeedMbps} Mbps
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {property.tenantPreference}
          </span>
          {property.freeCancellation && (
            <span className="flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">
              <ShieldCheck className="h-3 w-3" /> Free Cancellation
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-4">
          <div>
            <span className="text-xl font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="block text-xs font-semibold text-slate-400"> / night</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleCompare(property.id)
              }}
              disabled={!isComparing(property.id) && compareIds.length >= 3}
              title="Add to compare"
              className={`flex items-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                isComparing(property.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-xl bg-primary-50 px-4 py-2.5 text-xs font-bold text-primary-700 transition group-hover:bg-primary-100">
              Check Room
            </span>
          </div>
        </div>
      </div>
    </MotionLink>
  )
}
