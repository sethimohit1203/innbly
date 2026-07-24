import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Images,
  MapPin,
  BadgeCheck,
  Sofa,
  Wifi,
  Wind,
  Bath,
  Zap,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Car,
  Dumbbell,
  Star,
  MessageCircle,
  Users,
  Clock,
  TrainFront,
  Building2,
  Landmark as LandmarkIcon,
  ShoppingBag,
  GraduationCap,
  Waves,
  Plane,
  MapPinned,
  ThumbsUp,
  PlayCircle,
  Rotate3d,
  X,
  Ban,
  Volume2,
  PartyPopper,
  CalendarX2,
  Scale,
  Lock,
  Headset,
} from 'lucide-react'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { Footer } from '../components/Footer'
import { PropertyCard } from '../components/PropertyCard'
import { DateRangePicker } from '../components/DateRangePicker'
import { GuestCounter } from '../components/GuestCounter'
import { PriceCalendar } from '../components/PriceCalendar'
import { Reveal } from '../components/Reveal'
import { FAQAccordion } from '../components/FAQAccordion'
import { BookingModal } from '../components/BookingModal'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useCompare } from '../context/CompareContext'
import { useToast } from '../context/ToastContext'
import { useProperties } from '../context/PropertiesContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getPaidPropertyIds } from '../lib/myBookings'
import type { LandmarkType, TenantPreference } from '../types'

const landmarkIcons: Record<LandmarkType, JSX.Element> = {
  Metro: <TrainFront className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Restaurant: <UtensilsCrossed className="h-4 w-4" />,
  Hospital: <Building2 className="h-4 w-4" />,
  Market: <ShoppingBag className="h-4 w-4" />,
  College: <GraduationCap className="h-4 w-4" />,
  Mall: <ShoppingBag className="h-4 w-4" />,
  Beach: <Waves className="h-4 w-4" />,
  Temple: <LandmarkIcon className="h-4 w-4" />,
  Airport: <Plane className="h-4 w-4" />,
  Office: <Building2 className="h-4 w-4" />,
  Attraction: <MapPinned className="h-4 w-4" />,
}

const AVAILABILITY_LABEL: Record<string, string> = {
  Available: 'Available',
  Limited: 'Limited Availability',
  Booked: 'Fully Booked',
}

const amenityIcons: Record<string, JSX.Element> = {
  'Wi-Fi': <Wifi className="h-5 w-5" />,
  AC: <Wind className="h-5 w-5" />,
  'Attached Bath': <Bath className="h-5 w-5" />,
  'Power Backup': <Zap className="h-5 w-5" />,
  Housekeeping: <Sparkles className="h-5 w-5" />,
  Meals: <UtensilsCrossed className="h-5 w-5" />,
  CCTV: <ShieldCheck className="h-5 w-5" />,
  Parking: <Car className="h-5 w-5" />,
  Gym: <Dumbbell className="h-5 w-5" />,
  Laundry: <Sparkles className="h-5 w-5" />,
}

const amenityGroups: Record<string, string[]> = {
  Comfort: ['AC', 'Attached Bath', 'Laundry'],
  Utilities: ['Wi-Fi', 'Power Backup', 'CCTV', 'Parking'],
  Services: ['Housekeeping', 'Meals', 'Gym'],
}

export function PropertyDetailPage() {
  const { id } = useParams()
  const { properties, getPropertyById } = useProperties()
  const property = id ? getPropertyById(id) : undefined
  const { isSaved, toggleSaved } = useSavedProperties()
  const { addRecentlyViewed } = useRecentlyViewed()
  const { isComparing, toggleCompare, compareIds } = useCompare()
  const { showToast } = useToast()
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const [descExpanded, setDescExpanded] = useState(false)
  const [tenantType, setTenantType] = useState<TenantPreference>('Anyone')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isPaid, setIsPaid] = useState(() => (property ? getPaidPropertyIds().includes(property.id) : false))
  const saved = property ? isSaved(property.id) : false

  useEffect(() => {
    if (property) addRecentlyViewed(property.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id])

  useEffect(() => {
    if (photoIndex === null || !property) return
    const onKey = (e: KeyboardEvent) => {
      const count = property.images.length
      if (e.key === 'Escape') setPhotoIndex(null)
      if (e.key === 'ArrowRight') setPhotoIndex((i) => (i === null ? i : (i + 1) % count))
      if (e.key === 'ArrowLeft') setPhotoIndex((i) => (i === null ? i : (i - 1 + count) % count))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photoIndex, property])

  usePageMeta(
    property ? `${property.title} for Rent in ${property.neighborhood}, ${property.city}` : 'Property not found',
    property
      ? `${property.title} — ₹${property.price.toLocaleString('en-IN')}/night stay for up to ${property.maxGuests} guests in ${property.neighborhood}, ${property.city}. ${property.verified ? 'Verified property.' : ''} Schedule a free visit today.`
      : undefined,
  )

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Property not found</h2>
        <Link to="/search" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${property.ownerPhone.replace('+', '')}?text=${encodeURIComponent(
    `Hi ${property.ownerName}, I'm interested in "${property.title}" listed on innbly. Could you share more details?`,
  )}`

  const handleShare = async () => {
    const shareData = { title: property.title, text: `Check out ${property.title} on innbly`, url: window.location.href }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled the native share sheet — not an error.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard')
    } catch {
      showToast('Could not copy the link — copy it from the address bar instead.', 'error')
    }
  }

  const nearby = properties.filter((p) => p.id !== property.id && p.city === property.city)
  const recommendations = (nearby.length >= 3 ? nearby : properties.filter((p) => p.id !== property.id)).slice(0, 4)

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      {/* Breadcrumbs + utility buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="hover:text-primary-600">{property.city}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{property.neighborhood}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaved(property.id)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={() => toggleCompare(property.id)}
            disabled={!isComparing(property.id) && compareIds.length >= 3}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              isComparing(property.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'
            }`}
          >
            <Scale className="h-4 w-4" /> {isComparing(property.id) ? 'Added to Compare' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Hero media grid — collapses to a single full-width photo on mobile instead of
          cramming the 5-column desktop layout into tiny unusable strips */}
      <div className="relative mb-8 grid h-64 grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:h-[420px] sm:grid-cols-5 sm:grid-rows-2">
        <button
          onClick={() => setPhotoIndex(0)}
          className="h-full w-full overflow-hidden sm:col-span-3 sm:row-span-2"
        >
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition hover:brightness-95"
          />
        </button>
        {property.images.slice(1, 5).map((img, i) => (
          <button key={i} onClick={() => setPhotoIndex(i + 1)} className="hidden h-full w-full overflow-hidden sm:col-span-1 sm:block">
            <img src={img} alt="" className="h-full w-full object-cover transition hover:brightness-95" />
          </button>
        ))}
        <button
          onClick={() => setPhotoIndex(0)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-card-hover transition hover:bg-white"
        >
          <Images className="h-4 w-4" /> View all photos
        </button>
      </div>

      {/* Media: video tour / 360 walkthrough — honest placeholder, no fabricated media */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-4">
        <span className="text-sm font-semibold text-slate-500">Want more than photos?</span>
        <button
          onClick={() => showToast('Video tour coming soon for this property — check back later.')}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
        >
          <PlayCircle className="h-4 w-4" /> Video Tour — Coming Soon
        </button>
        <button
          onClick={() => showToast('360° virtual walkthrough coming soon for this property.')}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
        >
          <Rotate3d className="h-4 w-4" /> 360° Tour — Coming Soon
        </button>
      </div>

      {photoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 animate-fade-in"
          onClick={() => setPhotoIndex(null)}
        >
          <button
            onClick={() => setPhotoIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIndex((i) => (i === null ? i : (i - 1 + property.images.length) % property.images.length))
            }}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <img
            src={property.images[photoIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-4xl rounded-xl object-contain"
          />

          <button
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIndex((i) => (i === null ? i : (i + 1) % property.images.length))
            }}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-white/80">
            {photoIndex + 1} / {property.images.length}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* LEFT COLUMN 65% */}
        <div className="lg:w-[65%]">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{property.title}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.address}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {property.verified && (
              <span className="flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified Property
              </span>
            )}
            {property.furnished && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Sofa className="h-3.5 w-3.5" /> Fully Furnished
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Users className="h-3.5 w-3.5" /> Up to {property.maxGuests} guests
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              For {property.tenantPreference}
            </span>
            {property.instantBook && (
              <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                <Zap className="h-3.5 w-3.5" /> Instant Book
              </span>
            )}
            {property.freeCancellation && (
              <span className="flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Free Cancellation
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                property.availabilityStatus === 'Available'
                  ? 'bg-accent-50 text-accent-700'
                  : property.availabilityStatus === 'Limited'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {AVAILABILITY_LABEL[property.availabilityStatus]}
            </span>
          </div>

          {/* Description */}
          <Reveal className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="mb-2 text-lg font-bold text-slate-900">About this property</h2>
            <p className={`text-sm leading-relaxed text-slate-600 ${descExpanded ? '' : 'line-clamp-4'}`}>
              {property.description}
            </p>
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-sm font-semibold text-primary-600 hover:underline"
            >
              {descExpanded ? 'Show less' : 'Read More'}
            </button>
          </Reveal>

          {/* Amenities */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Amenities</h2>
            <div className="space-y-5">
              {Object.entries(amenityGroups).map(([group, items]) => {
                const present = items.filter((a) => property.amenities.includes(a))
                if (present.length === 0) return null
                return (
                  <div key={group}>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{group}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {present.map((a) => (
                        <div
                          key={a}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition hover:border-primary-300 hover:bg-primary-50/50"
                        >
                          <span className="text-primary-600">{amenityIcons[a]}</span>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>

          {/* Location */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Location & Proximity</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                Walk Score: {Math.max(10, 100 - Math.round(
                  (property.landmarks.reduce((sum, l) => sum + l.walkMin, 0) / property.landmarks.length) * 3,
                ))}
              </span>
            </div>
            <MapPlaceholder className="h-64 w-full" label={property.neighborhood} />
            <div className="mt-4 space-y-1">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Nearby Landmarks</h3>
              {property.landmarks.map((l) => (
                <div
                  key={l.name}
                  className="flex items-center justify-between border-l-2 border-primary-200 py-2 pl-4 text-sm transition hover:border-primary-500"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="text-primary-600">{landmarkIcons[l.type]}</span> {l.name}
                  </span>
                  <span className="text-slate-500">
                    {l.distanceM}m ({l.walkMin} min walk)
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Host Profile */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Meet your host</h2>
            <Link
              to={`/host/${encodeURIComponent(property.ownerName)}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-primary-300 hover:bg-primary-50/30"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                {property.ownerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{property.ownerName}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-accent-700">
                  <Clock className="h-3.5 w-3.5" /> {property.hostResponseTime}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {property.hostResponseRate}% response rate · Hosting since {property.hostJoinedYear} · {property.hostTotalListings} listing{property.hostTotalListings > 1 ? 's' : ''}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{property.hostBio}</p>
                <span className="mt-2 inline-block text-xs font-bold text-primary-600 hover:underline">View host profile →</span>
              </div>
            </Link>
          </Reveal>

          {/* House Rules */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">House Rules</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" /> Check-in / check-out flexible with host
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 shrink-0 text-slate-400" /> Up to {property.maxGuests} guest{property.maxGuests > 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Ban className="h-4 w-4 shrink-0 text-slate-400" /> No smoking indoors
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <PartyPopper className="h-4 w-4 shrink-0 text-slate-400" /> No parties or events
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Volume2 className="h-4 w-4 shrink-0 text-slate-400" /> Quiet hours 10 PM – 7 AM
              </div>
              {property.tenantPreference !== 'Anyone' && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" /> This stay is for {property.tenantPreference.toLowerCase()}
                </div>
              )}
            </div>
          </Reveal>

          {/* Cancellation Policy */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Cancellation Policy</h2>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${property.freeCancellation ? 'bg-accent-50 text-accent-600' : 'bg-slate-100 text-slate-500'}`}>
                {property.freeCancellation ? <ShieldCheck className="h-4.5 w-4.5" /> : <CalendarX2 className="h-4.5 w-4.5" />}
              </span>
              <div>
                <p className="font-bold text-slate-900">
                  {property.freeCancellation ? 'Free cancellation before check-in' : 'Non-refundable booking'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {property.freeCancellation
                    ? 'Cancel before your check-in date for a full refund of the booking amount. The security deposit is refunded separately by the host at checkout, as agreed.'
                    : 'This listing does not offer free cancellation. Reach out to the host directly before booking if your plans might change.'}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Trust & Safety */}
          <Reveal className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Trust & Safety</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 p-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${property.verified ? 'bg-accent-50 text-accent-600' : 'bg-slate-100 text-slate-400'}`}>
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{property.verified ? 'Verified Listing' : 'Pending Verification'}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {property.verified ? "Reviewed and approved by innbly's team." : 'This listing is awaiting a verification review.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Lock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Secure Communication</p>
                  <p className="mt-0.5 text-xs text-slate-500">Message the host directly — your phone number stays private.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Headset className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Need Help?</p>
                  <Link to="/contact" className="mt-0.5 block text-xs font-semibold text-primary-600 hover:underline">
                    Contact innbly Support →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* RIGHT COLUMN 35% - sticky booking card */}
        <div className="lg:w-[35%]">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card-hover">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{property.price.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500"> /night</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {property.rating}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Security deposit: ₹{property.deposit.toLocaleString('en-IN')} (refundable)
            </p>

            <fieldset className="mt-5">
              <legend className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Tenant Type</legend>
              <div className="grid grid-cols-3 gap-2">
                {(['Boys', 'Girls', 'Anyone'] as TenantPreference[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenantType(t)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      tenantType === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Check-in — Check-out</span>
              <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }} />
            </div>

            <div className="mt-4">
              <GuestCounter value={guests} onChange={setGuests} max={property.maxGuests} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <PriceCalendar propertyId={property.id} />
            </div>

            {isPaid ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
              >
                <MessageCircle className="h-4 w-4" /> Chat with Host
              </a>
            ) : (
              <button
                onClick={() => setShowBookingModal(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700 hover:shadow-card-hover"
              >
                Reserve & Pay
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <Reveal className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Ratings & Reviews</h2>
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-2/5">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900">{property.rating}</span>
              <span className="text-lg text-slate-500">out of 5</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{property.reviewCount} verified reviews</p>
            <div className="mt-6 space-y-3">
              {property.ratingBreakdown.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{r.label}</span>
                    <span className="font-semibold">{r.score}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-all"
                      style={{ width: `${(r.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {property.reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {r.name}
                        {r.verifiedStay && (
                          <span className="flex items-center gap-0.5 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                            <BadgeCheck className="h-3 w-3" /> Verified Stay
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{r.occupation} · {r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.text}</p>
                <div className="mt-3 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs font-semibold text-slate-500">
                  {r.wouldRecommend && (
                    <span className="flex items-center gap-1 text-accent-700">
                      <ThumbsUp className="h-3.5 w-3.5" /> Would recommend
                    </span>
                  )}
                  <span>{r.helpfulVotes} found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Property FAQ */}
      <Reveal className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        <FAQAccordion
          items={[
            {
              q: 'What time is check-in and check-out?',
              a: `Exact timing is coordinated directly with ${property.ownerName} once your stay is confirmed — message the host to arrange a time that works for you.`,
            },
            {
              q: 'Is the security deposit refundable?',
              a: `Yes — the ₹${property.deposit.toLocaleString('en-IN')} security deposit is refundable and returned by the host after checkout, provided the property is left in good condition.`,
            },
            {
              q: 'How quickly will the host respond?',
              a: `Based on past guest interactions, ${property.ownerName} has a ${property.hostResponseRate}% response rate and typically replies within ${property.hostResponseTime.replace(/^Usually responds within /i, '')}.`,
            },
            {
              q: 'Can I bring more guests than listed?',
              a: `This space is set up for up to ${property.maxGuests} guest${property.maxGuests > 1 ? 's' : ''}. Message the host before booking if you need to bring more.`,
            },
          ]}
        />
      </Reveal>

      {/* More Places Nearby */}
      <Reveal className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">More Places Nearby</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </Reveal>
    </div>

    {/* Mobile sticky booking bar — the right-column card is desktop-only sticky, so
        mobile gets its own compact bottom bar with the same primary action.
        Offset above md:hidden so it stacks above the global MobileBottomNav
        instead of overlapping it below the md breakpoint. */}
    <div className="fixed inset-x-0 bottom-20 z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:bottom-0 lg:hidden">
      <div>
        <span className="text-lg font-extrabold text-slate-900">₹{property.price.toLocaleString('en-IN')}</span>
        <span className="text-sm text-slate-500"> /night</span>
      </div>
      {isPaid ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-600"
        >
          <MessageCircle className="h-4 w-4" /> Chat with Host
        </a>
      ) : (
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
        >
          Reserve & Pay
        </button>
      )}
    </div>
    <Footer />
    {/* Spacer so the fixed mobile booking bar (and, below md, the bottom nav
        beneath it) never covers the last bit of footer content */}
    <div className="h-32 md:h-16 lg:hidden" />
    {showBookingModal && (
      <BookingModal
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        onClose={() => setShowBookingModal(false)}
        onBooked={() => {
          setIsPaid(true)
          setShowBookingModal(false)
        }}
      />
    )}
    </>
  )
}
